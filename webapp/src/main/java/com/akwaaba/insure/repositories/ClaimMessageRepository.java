package com.undawriter.insure.repositories;

import com.undawriter.insure.models.ClaimMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ClaimMessageRepository extends JpaRepository<ClaimMessage, Long> {

    @Query("SELECT m FROM ClaimMessage m JOIN FETCH m.user WHERE m.claim.id = :claimId ORDER BY m.createdAt ASC")
    List<ClaimMessage> findByClaimIdOrderByCreatedAtAsc(@Param("claimId") Long claimId);
}
