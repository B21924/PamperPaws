package com.pamperpaw.vet.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VetDTO {

    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    @Min(value = 0, message = "Experience must be positive")
    private int experience;

    private String phone;

    @Email(message = "Invalid email")
    private String email;

    private String clinicAddress;
    private String availableDays;
    private String availableTime;
}