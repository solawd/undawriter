package com.undawriter.insure.repositories;

import com.undawriter.insure.models.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Long>, JpaSpecificationExecutor<Policy> {
    List<Policy> findByUserId(Long userId);
    List<Policy> findByUser_Email(String email);
    List<Policy> findByStatus(Policy.Status status);
    long countByCreatedAtAfter(LocalDateTime date);
    List<Policy> findByCreatedAtAfter(LocalDateTime date);
}
