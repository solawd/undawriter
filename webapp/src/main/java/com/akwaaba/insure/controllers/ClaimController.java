package com.undawriter.insure.controllers;

import com.undawriter.insure.models.ClaimRequest;
import com.undawriter.insure.models.ClaimResponse;
import com.undawriter.insure.services.ClaimService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimService claimService;

    @PostMapping(value = "/file", consumes = {"multipart/form-data"})
    public ResponseEntity<ClaimResponse> fileClaim(@ModelAttribute ClaimRequest request, Authentication authentication) {
        // Here we could verify that the authenticated user actually owns the policy
        ClaimResponse response = claimService.fileClaim(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/user")
    public ResponseEntity<List<ClaimResponse>> getUserClaims(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(claimService.getUserClaims(email));
    }

    @GetMapping
    public ResponseEntity<List<ClaimResponse>> getAllClaims() {
        // Staff portal would use this to list claims for review
        return ResponseEntity.ok(claimService.getAllClaims());
    }
}
