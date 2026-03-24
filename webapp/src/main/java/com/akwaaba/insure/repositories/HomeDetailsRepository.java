package com.undawriter.insure.repositories;

import com.undawriter.insure.models.HomeDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface HomeDetailsRepository extends JpaRepository<HomeDetails, Long> {
    Optional<HomeDetails> findByPolicyId(Long policyId);
}
