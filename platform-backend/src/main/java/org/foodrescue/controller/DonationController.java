package org.foodrescue.controller;

import org.foodrescue.domain.Donation;
import org.foodrescue.domain.User;
import org.foodrescue.repository.DonationRepository;
import org.foodrescue.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
public class DonationController {
    private final DonationRepository donationRepository;
    private final UserRepository userRepository;

    public DonationController(DonationRepository donationRepository, UserRepository userRepository) {
        this.donationRepository = donationRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Donation> list(@RequestParam(required = false) String status) {
        if (status == null) return donationRepository.findAll();
        return donationRepository.findByStatus(status);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) {
        Long donorId = Long.valueOf(body.getOrDefault("donorId", "0"));
        var uOpt = userRepository.findById(donorId);
        if (uOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "invalid donor"));
        Donation d = new Donation();
        d.setDonor(uOpt.get());
        d.setTitle(body.get("title"));
        d.setDescription(body.get("description"));
        donationRepository.save(d);
        return ResponseEntity.ok(d);
    }
}
