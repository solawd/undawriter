package com.undawriter.insure.controllers;

import com.undawriter.insure.models.MotorDetails;
import com.undawriter.insure.models.Policy;
import com.undawriter.insure.repositories.MotorDetailsRepository;
import com.undawriter.insure.repositories.PolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyRepository policyRepository;
    private final MotorDetailsRepository motorDetailsRepository;

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPolicyDetails(@PathVariable Long id, Authentication authentication) {
        String userEmail = authentication.getName();

        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        if (!policy.getUser().getEmail().equals(userEmail)) {
            return ResponseEntity.status(403).build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("policy", policy);

        if (policy.getProductType() == Policy.ProductType.MOTOR) {
            Optional<MotorDetails> motorDetails = motorDetailsRepository.findByPolicyId(policy.getId());
            motorDetails.ifPresent(details -> response.put("motorDetails", details));
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<java.util.List<Map<String, Object>>> getUserPolicies(Authentication authentication) {
        String userEmail = authentication.getName();
        java.util.List<Policy> policies = policyRepository.findByUser_Email(userEmail);

        java.util.List<Map<String, Object>> response = policies.stream().map(policy -> {
            Map<String, Object> map = new HashMap<>();
            map.put("policy", policy);
            if (policy.getProductType() == Policy.ProductType.MOTOR) {
                motorDetailsRepository.findByPolicyId(policy.getId())
                        .ifPresent(details -> map.put("motorDetails", details));
            }
            return map;
        }).toList();

        return ResponseEntity.ok(response);
    }
}
