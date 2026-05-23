package com.undawriter.insure.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;

@Entity
@Table(name = "motor_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MotorDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false, unique = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Policy policy;

    @Column(nullable = false)
    private String regNumber;

    @Column(nullable = false, length = 17)
    private String chassisNumber;

    @Column(nullable = false)
    private String makeModel;

    @Column(nullable = false, name = "manufacture_year")
    private Integer year;

    @Column(nullable = false)
    private String bodyType;

    @Column(nullable = false)
    private Integer seatingCapacity;

    @Column(nullable = false)
    private BigDecimal sumInsured;

    public enum Usage {
        PRIVATE, COMMERCIAL
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "vehicle_usage")
    private Usage usage;

    public enum CoverageType {
        THIRD_PARTY, COMPREHENSIVE
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CoverageType coverageType;
}
