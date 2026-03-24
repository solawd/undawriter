package com.undawriter.insure.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "travel_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false, unique = true)
    private Policy policy;

    @Column(nullable = false)
    private String passportNumber;

    @Column(nullable = false)
    private String countryOfIssue;

    public enum Region {
        SCHENGEN, WORLDWIDE, AFRICA
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Region destinationRegion;

    @Column(nullable = false)
    private String tripPurpose;

    @Column(nullable = false)
    private String nextOfKinContact;

    @Column(nullable = false)
    private Boolean preExistingConditions;
}
