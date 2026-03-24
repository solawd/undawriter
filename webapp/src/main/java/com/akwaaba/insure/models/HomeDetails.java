package com.undawriter.insure.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;

@Entity
@Table(name = "home_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomeDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false, unique = true)
    private Policy policy;

    @Column(nullable = false)
    private String ghanaPostGps;

    @Column(nullable = false)
    private String propertyType;

    @Column(nullable = false)
    private String wallMaterial;

    @Column(nullable = false)
    private String roofMaterial;

    @Column(nullable = false)
    private String occupancy;

    @Column(nullable = false)
    private BigDecimal sumInsuredBuilding;

    @Column(nullable = false)
    private BigDecimal sumInsuredContents;
}
