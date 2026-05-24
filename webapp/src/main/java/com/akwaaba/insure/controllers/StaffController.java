package com.undawriter.insure.controllers;

import com.undawriter.insure.models.Claim;
import com.undawriter.insure.models.ClaimResponse;
import com.undawriter.insure.models.DashboardStatsResponse;
import com.undawriter.insure.models.Policy;
import com.undawriter.insure.models.StaffProfileUpdateRequest;
import com.undawriter.insure.models.User;
import com.undawriter.insure.repositories.UserRepository;
import com.undawriter.insure.services.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(staffService.getDashboardStats());
    }

    @GetMapping("/policies")
    public ResponseEntity<Page<Policy>> getPolicies(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(staffService.getPolicies(search, pageable));
    }

    @GetMapping("/policies/{id}")
    public ResponseEntity<Map<String, Object>> getPolicyDetails(@PathVariable Long id) {
        return ResponseEntity.ok(staffService.getPolicyDetails(id));
    }

    @GetMapping("/claims")
    public ResponseEntity<Page<ClaimResponse>> getClaims(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(staffService.getClaims(search, pageable));
    }

    @GetMapping("/customers")
    public ResponseEntity<Page<User>> getCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(staffService.getCustomers(search, pageable));
    }

    @GetMapping("/customers/{id}")
    public ResponseEntity<User> getCustomerDetails(@PathVariable Long id) {
        return ResponseEntity.ok(staffService.getCustomerDetails(id));
    }

    @GetMapping("/customers/{id}/policies")
    public ResponseEntity<?> getCustomerPolicies(@PathVariable Long id) {
        return ResponseEntity.ok(staffService.getCustomerPolicies(id));
    }

    @GetMapping("/customers/{id}/claims")
    public ResponseEntity<?> getCustomerClaims(@PathVariable Long id) {
        return ResponseEntity.ok(staffService.getCustomerClaims(id));
    }

    @GetMapping("/claims/{id}")
    public ResponseEntity<ClaimResponse> getClaimDetails(@PathVariable Long id) {
        return ResponseEntity.ok(staffService.getClaimDetails(id));
    }

    @PutMapping("/claims/{id}/status")
    public ResponseEntity<ClaimResponse> updateClaimStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        Claim.Status status = Claim.Status.valueOf(request.get("status"));
        String adjusterNotes = request.get("adjusterNotes");
        return ResponseEntity.ok(staffService.updateClaimStatus(id, status, adjusterNotes));
    }

    @GetMapping("/claims/{id}/messages")
    public ResponseEntity<List<com.undawriter.insure.models.ClaimMessageResponse>> getClaimMessages(@PathVariable Long id) {
        return ResponseEntity.ok(staffService.getClaimMessages(id));
    }

    @PostMapping("/claims/{id}/messages")
    public ResponseEntity<com.undawriter.insure.models.ClaimMessageResponse> addClaimMessage(
            @PathVariable Long id,
            @RequestBody com.undawriter.insure.models.ClaimMessageRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(staffService.addClaimMessage(id, request, authentication.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Authentication authentication, @RequestBody StaffProfileUpdateRequest request) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Incorrect current password."));
            }
            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        }

        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully.",
                "user", Map.of(
                        "email", user.getEmail(),
                        "fullName", user.getFullName()
                )
        ));
    }
}
