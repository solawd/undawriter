package com.undawriter.insure.services;

import com.undawriter.insure.models.Claim;
import com.undawriter.insure.models.ClaimRequest;
import com.undawriter.insure.models.ClaimResponse;
import com.undawriter.insure.models.Policy;
import com.undawriter.insure.repositories.ClaimRepository;
import com.undawriter.insure.repositories.PolicyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final PolicyRepository policyRepository;

    public ClaimResponse fileClaim(ClaimRequest request) {
        log.info("Filing new claim for policy ID: {}", request.getPolicyId());

        Policy policy = policyRepository.findById(request.getPolicyId())
                .orElseThrow(() -> new IllegalArgumentException("Policy not found"));

        if (policy.getStatus() != Policy.Status.ACTIVE) {
            throw new IllegalStateException("Cannot file claim for a non-active policy.");
        }

        List<String> savedFileUrls = new ArrayList<>();
        if (request.getFiles() != null && !request.getFiles().isEmpty()) {
            // Use absolute path to the project's upload directory
            String userDir = System.getProperty("user.dir");
            File uploadDir = new File(userDir, "uploads");
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            for (MultipartFile file : request.getFiles()) {
                if (!file.isEmpty()) {
                    try {
                        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.-]", "_");
                        File dest = new File(uploadDir, filename);
                        file.transferTo(dest);
                        savedFileUrls.add("/uploads/" + filename);
                    } catch (Exception e) {
                        log.error("Failed to save file", e);
                        throw new RuntimeException("Failed to save document");
                    }
                }
            }
        }

        String evidenceUrlsStr = String.join(",", savedFileUrls);

        Claim claim = Claim.builder()
                .policy(policy)
                .payoutType(request.getPayoutType())
                .description(request.getDescription())
                .evidenceUrls(evidenceUrlsStr)
                .status(Claim.Status.SUBMITTED)
                .createdAt(LocalDateTime.now())
                .build();

        Claim savedClaim = claimRepository.save(claim);
        log.info("Claim created with ID: {}", savedClaim.getId());
        
        return ClaimResponse.fromEntity(savedClaim);
    }

    public List<ClaimResponse> getAllClaims() {
        return claimRepository.findAll().stream()
                .map(ClaimResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ClaimResponse> getUserClaims(String email) {
        return claimRepository.findByPolicyUserEmail(email).stream()
                .map(ClaimResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
