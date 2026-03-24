package com.undawriter.insure.repositories;

import com.undawriter.insure.models.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long>, JpaSpecificationExecutor<Claim> {
    List<Claim> findByPolicyId(Long policyId);
    List<Claim> findByStatus(Claim.Status status);
    List<Claim> findByPolicyUserEmail(String email);
    long countByStatus(Claim.Status status);
    long countByStatusNot(Claim.Status status);
}
