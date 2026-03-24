package com.undawriter.insure.repositories;

import com.undawriter.insure.models.TravelDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TravelDetailsRepository extends JpaRepository<TravelDetails, Long> {
    Optional<TravelDetails> findByPolicyId(Long policyId);
}
