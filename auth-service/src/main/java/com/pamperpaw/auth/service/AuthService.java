package com.pamperpaw.auth.service;

import com.pamperpaw.auth.dto.LoginRequest;
import com.pamperpaw.auth.dto.RegisterRequest;
import com.pamperpaw.auth.entity.User;
import com.pamperpaw.auth.repository.UserRepository;
import com.pamperpaw.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public String register(RegisterRequest request) {
        String username = request.getUsername().trim();
        String role = request.getRole().trim().toUpperCase();

        if (userRepository.findByUsername(username).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        if (!role.equals("ADMIN") && !role.equals("CUSTOMER") && !role.equals("VET")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role must be ADMIN, CUSTOMER, or VET");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        userRepository.save(user);

        log.info("Registered auth user username={} role={}", username, role);
        return "User registered successfully";
    }

    public String login(LoginRequest request) {
        String username = request.getUsername().trim();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        log.info("Generated JWT for username={} role={}", username, user.getRole());
        return jwtUtil.generateToken(user.getUsername(), user.getRole());
    }
}
