package com.undawriter.insure.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false)
    private Policy policy;

    public enum Status {
        SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.SUBMITTED;

    public enum PayoutType {
        CASH_IN_LIEU, SERVICE_PROVIDER
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PayoutType payoutType;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Could use a separate table for multiple URLs, but storing as JSON/comma-separated is okay for MVP
    @Column(columnDefinition = "TEXT")
    private String evidenceUrls; 

    @Column(columnDefinition = "TEXT")
    private String adjusterNotes;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
