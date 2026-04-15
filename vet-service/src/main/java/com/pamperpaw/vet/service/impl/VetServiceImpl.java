package com.pamperpaw.vet.service.impl;

import com.pamperpaw.vet.dto.VetDTO;
import com.pamperpaw.vet.entity.Vet;
import com.pamperpaw.vet.exception.VetNotFoundException;
import com.pamperpaw.vet.repository.VetRepository;
import com.pamperpaw.vet.service.VetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class VetServiceImpl implements VetService {

    private final VetRepository vetRepository;

    private VetDTO mapToDTO(Vet vet) {
        return VetDTO.builder()
                .id(vet.getId())
                .name(vet.getName())
                .specialization(vet.getSpecialization())
                .experience(vet.getExperience())
                .phone(vet.getPhone())
                .email(vet.getEmail())
                .clinicAddress(vet.getClinicAddress())
                .availableDays(vet.getAvailableDays())
                .availableTime(vet.getAvailableTime())
                .build();
    }

    private Vet mapToEntity(VetDTO dto) {
        return Vet.builder()
                .id(dto.getId())
                .name(dto.getName())
                .specialization(dto.getSpecialization())
                .experience(dto.getExperience())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .clinicAddress(dto.getClinicAddress())
                .availableDays(dto.getAvailableDays())
                .availableTime(dto.getAvailableTime())
                .build();
    }

    @Override
    public VetDTO createVet(VetDTO dto) {
        log.info("Creating vet {}", dto.getName());
        return mapToDTO(vetRepository.save(mapToEntity(dto)));
    }

    @Override
    public List<VetDTO> getAllVets() {
        log.info("Fetching all vets");
        return vetRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public VetDTO getVetById(Long id) {
        Vet vet = vetRepository.findById(id)
                .orElseThrow(() -> new VetNotFoundException("Vet not found with id " + id));
        return mapToDTO(vet);
    }

    @Override
    public VetDTO updateVet(Long id, VetDTO dto) {
        Vet vet = vetRepository.findById(id)
                .orElseThrow(() -> new VetNotFoundException("Vet not found with id " + id));

        vet.setName(dto.getName());
        vet.setSpecialization(dto.getSpecialization());
        vet.setExperience(dto.getExperience());
        vet.setPhone(dto.getPhone());
        vet.setEmail(dto.getEmail());
        vet.setClinicAddress(dto.getClinicAddress());
        vet.setAvailableDays(dto.getAvailableDays());
        vet.setAvailableTime(dto.getAvailableTime());

        log.info("Updating vet with id={}", id);
        return mapToDTO(vetRepository.save(vet));
    }

    @Override
    public void deleteVet(Long id) {
        vetRepository.findById(id)
                .orElseThrow(() -> new VetNotFoundException("Vet not found with id " + id));
        vetRepository.deleteById(id);
        log.info("Deleted vet with id={}", id);
    }

    @Async
    @Override
    public CompletableFuture<List<VetDTO>> getAllVetsAsync() {
        return CompletableFuture.completedFuture(getAllVets());
    }

    @Override
    public List<VetDTO> getVetsBySpecialization(String specialization) {
        return vetRepository.findBySpecialization(specialization)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public List<VetDTO> getVetsByLocation(String location) {
        return vetRepository.findByClinicAddress(location)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public List<VetDTO> getVetsByExperience(int experience) {
        return vetRepository.findByExperienceGreaterThanEqual(experience)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }
    
    
    private String format(int hour) {
        String suffix = hour >= 12 ? "PM" : "AM";
        int h = hour > 12 ? hour - 12 : hour;
        return h + " " + suffix;
    }
    
    
    
    private int convertTo24(String time) {

        time = time.trim().toUpperCase();

        int hour = Integer.parseInt(time.replaceAll("[^0-9]", ""));

        if (time.contains("PM") && hour != 12) {
            hour += 12;
        }

        if (time.contains("AM") && hour == 12) {
            hour = 0;
        }

        return hour;
    }
    
    @Override
    public List<String> getAvailableSlots(Long vetId, String date) {

        Vet vet = vetRepository.findById(vetId)
                .orElseThrow(() -> new RuntimeException("Vet not found"));

        String time = vet.getAvailableTime();

        String[] parts = time.split("-");

        int start = convertTo24(parts[0]);
        int end = convertTo24(parts[1]);

        List<String> allSlots = new ArrayList<>();

        for (int i = start; i < end; i++) {
            String slot = format(i) + " - " + format(i + 1);
            allSlots.add(slot);
        }

        return allSlots;
    }
}
