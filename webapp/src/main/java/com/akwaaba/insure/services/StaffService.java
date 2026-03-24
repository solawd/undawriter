package com.undawriter.insure.services;

import com.undawriter.insure.models.Claim;
import com.undawriter.insure.models.ClaimResponse;
import com.undawriter.insure.models.DashboardStatsResponse;
import com.undawriter.insure.models.Policy;
import com.undawriter.insure.repositories.ClaimRepository;
import com.undawriter.insure.repositories.HomeDetailsRepository;
import com.undawriter.insure.repositories.MotorDetailsRepository;
import com.undawriter.insure.repositories.PolicyRepository;
import com.undawriter.insure.repositories.TravelDetailsRepository;
import com.undawriter.insure.repositories.UserRepository;
import com.undawriter.insure.models.User;
import jakarta.persistence.criteria.JoinType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class StaffService {

    private final PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;
    private final MotorDetailsRepository motorDetailsRepository;
    private final HomeDetailsRepository homeDetailsRepository;
    private final TravelDetailsRepository travelDetailsRepository;
    private final UserRepository userRepository;

    public DashboardStatsResponse getDashboardStats() {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(6).withHour(0).withMinute(0).withSecond(0).withNano(0);
        List<Policy> recentPolicies = policyRepository.findByCreatedAtAfter(sevenDaysAgo);

        Map<String, Long> dailyCounts = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // Initialize last 7 days with 0
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            dailyCounts.put(date.format(formatter), 0L);
        }

        for (Policy policy : recentPolicies) {
            String dateString = policy.getCreatedAt().format(formatter);
            dailyCounts.put(dateString, dailyCounts.getOrDefault(dateString, 0L) + 1);
        }

        List<DashboardStatsResponse.DailyPolicyCount> weeklyChart = dailyCounts.entrySet().stream()
                .map(e -> DashboardStatsResponse.DailyPolicyCount.builder()
                        .date(e.getKey())
                        .count(e.getValue())
                        .build())
                .collect(Collectors.toList());

        long pending = claimRepository.countByStatusNot(Claim.Status.APPROVED) - claimRepository.countByStatus(Claim.Status.REJECTED); // Everything not approved and not rejected
        // Alternatively, pending = count SUBMITTED + count UNDER_REVIEW
        long accuratePending = claimRepository.countByStatus(Claim.Status.SUBMITTED) + claimRepository.countByStatus(Claim.Status.UNDER_REVIEW);
        long rejected = claimRepository.countByStatus(Claim.Status.REJECTED);
        long successful = claimRepository.countByStatus(Claim.Status.APPROVED);

        return DashboardStatsResponse.builder()
                .weeklyPolicyPurchases(weeklyChart)
                .pendingClaimsCount(accuratePending)
                .rejectedClaimsCount(rejected)
                .successfulClaimsCount(successful)
                .build();
    }

    public Page<Policy> getPolicies(String search, Pageable pageable) {
        Specification<Policy> spec = Specification.where(null);
        if (search != null && !search.trim().isEmpty()) {
            String likePattern = "%" + search.toLowerCase() + "%";
            spec = (root, query, cb) -> {
                root.fetch("user", JoinType.LEFT); // Prevent N+1 if needed, though Page might ignore this in counts
                return cb.or(
                        cb.like(cb.lower(root.get("user").get("fullName")), likePattern),
                        cb.like(cb.lower(root.get("user").get("phoneNumber")), likePattern),
                        cb.like(cb.lower(root.get("user").get("ghanaCardId")), likePattern),
                        cb.like(cb.lower(root.get("nicStickerId")), likePattern)
                );
            };
        }
        return policyRepository.findAll(spec, pageable);
    }

    public Map<String, Object> getPolicyDetails(Long id) {
        Policy policy = policyRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Policy not found"));
        Map<String, Object> map = new HashMap<>();
        map.put("policy", policy);
        if (policy.getProductType() == Policy.ProductType.MOTOR) {
            motorDetailsRepository.findByPolicyId(policy.getId()).ifPresent(details -> map.put("motorDetails", details));
        } else if (policy.getProductType() == Policy.ProductType.HOME) {
            homeDetailsRepository.findByPolicyId(policy.getId()).ifPresent(details -> map.put("homeDetails", details));
        } else if (policy.getProductType() == Policy.ProductType.TRAVEL) {
            travelDetailsRepository.findByPolicyId(policy.getId()).ifPresent(details -> map.put("travelDetails", details));
        }
        return map;
    }

    public Page<ClaimResponse> getClaims(String search, Pageable pageable) {
        Specification<Claim> spec = Specification.where(null);
        if (search != null && !search.trim().isEmpty()) {
            String likePattern = "%" + search.toLowerCase() + "%";
            spec = (root, query, cb) -> {
                // Join policy and then user
                var policyJoin = root.join("policy", JoinType.LEFT);
                var userJoin = policyJoin.join("user", JoinType.LEFT);
                return cb.or(
                        cb.like(cb.lower(userJoin.get("fullName")), likePattern),
                        cb.like(cb.lower(userJoin.get("phoneNumber")), likePattern),
                        cb.like(cb.lower(userJoin.get("ghanaCardId")), likePattern)
                );
            };
        }

        return claimRepository.findAll(spec, pageable)
                .map(ClaimResponse::fromEntity);
    }

    public ClaimResponse getClaimDetails(Long id) {
        Claim claim = claimRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Claim not found"));
        return ClaimResponse.fromEntity(claim);
    }

    public ClaimResponse updateClaimStatus(Long id, Claim.Status newStatus, String adjusterNotes) {
        Claim claim = claimRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Claim not found"));
        claim.setStatus(newStatus);
        if (adjusterNotes != null && !adjusterNotes.isBlank()) {
            claim.setAdjusterNotes(adjusterNotes);
        }
        Claim saved = claimRepository.save(claim);
        return ClaimResponse.fromEntity(saved);
    }

    public Page<User> getCustomers(String search, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> cb.equal(root.get("profile"), User.Profile.CUSTOMER);

        if (search != null && !search.trim().isEmpty()) {
            String likePattern = "%" + search.toLowerCase() + "%";
            Specification<User> searchSpec = (root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("fullName")), likePattern),
                    cb.like(cb.lower(root.get("email")), likePattern),
                    cb.like(cb.lower(root.get("ghanaCardId")), likePattern),
                    cb.like(cb.lower(root.get("phoneNumber")), likePattern)
            );
            spec = spec.and(searchSpec);
        }
        return userRepository.findAll(spec, pageable);
    }

    public User getCustomerDetails(Long customerId) {
        return userRepository.findById(customerId).orElseThrow(() -> new IllegalArgumentException("Customer not found"));
    }

    public List<Policy> getCustomerPolicies(Long customerId) {
        return policyRepository.findByUserId(customerId);
    }

    public List<ClaimResponse> getCustomerClaims(Long customerId) {
        User user = userRepository.findById(customerId).orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        return claimRepository.findByPolicyUserEmail(user.getEmail())
                .stream()
                .map(ClaimResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
