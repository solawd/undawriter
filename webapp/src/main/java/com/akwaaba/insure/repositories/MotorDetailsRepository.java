package com.undawriter.insure.repositories;

import com.undawriter.insure.models.MotorDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MotorDetailsRepository extends JpaRepository<MotorDetails, Long> {
    Optional<MotorDetails> findByPolicyId(Long policyId);
}
