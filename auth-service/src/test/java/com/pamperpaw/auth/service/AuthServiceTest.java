package com.pamperpaw.auth.service;

import com.pamperpaw.auth.dto.LoginRequest;
import com.pamperpaw.auth.dto.RegisterRequest;
import com.pamperpaw.auth.entity.User;
import com.pamperpaw.auth.repository.UserRepository;
import com.pamperpaw.auth.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerCreatesUserWithEncodedPasswordAndUppercaseRole() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("  manu ");
        request.setPassword("secret");
        request.setRole("customer");
        request.setName("Manu");

        when(userRepository.findByUsername("manu")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("secret")).thenReturn("encoded-secret");

        String response = authService.register(request);

        assertEquals("User registered successfully", response);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerRejectsDuplicateUsername() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("manu");
        request.setPassword("secret");
        request.setRole("CUSTOMER");
        request.setName("Manu");

        when(userRepository.findByUsername("manu")).thenReturn(Optional.of(new User()));

        ResponseStatusException exception =
                assertThrows(ResponseStatusException.class, () -> authService.register(request));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerRejectsUnsupportedRole() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("manu");
        request.setPassword("secret");
        request.setRole("GROOMER");
        request.setName("Manu");

        when(userRepository.findByUsername("manu")).thenReturn(Optional.empty());

        ResponseStatusException exception =
                assertThrows(ResponseStatusException.class, () -> authService.register(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void loginReturnsJwtWhenCredentialsAreValid() {
        LoginRequest request = new LoginRequest();
        request.setUsername("  manu ");
        request.setPassword("secret");

        User user = new User();
        user.setUsername("manu");
        user.setPassword("encoded-secret");
        user.setRole("CUSTOMER");

        when(userRepository.findByUsername("manu")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "encoded-secret")).thenReturn(true);
        when(jwtUtil.generateToken("manu", "CUSTOMER")).thenReturn("jwt-token");

        String token = authService.login(request);

        assertEquals("jwt-token", token);
    }

    @Test
    void loginRejectsInvalidPassword() {
        LoginRequest request = new LoginRequest();
        request.setUsername("manu");
        request.setPassword("wrong");

        User user = new User();
        user.setUsername("manu");
        user.setPassword("encoded-secret");
        user.setRole("CUSTOMER");

        when(userRepository.findByUsername("manu")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded-secret")).thenReturn(false);

        ResponseStatusException exception =
                assertThrows(ResponseStatusException.class, () -> authService.login(request));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Invalid credentials"));
    }
}
