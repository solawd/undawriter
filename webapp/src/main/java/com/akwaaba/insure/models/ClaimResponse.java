package com.undawriter.insure.models;

import com.undawriter.insure.models.Claim.Status;
import com.undawriter.insure.models.Claim.PayoutType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ClaimResponse {
    private Long id;
    private Long policyId;
    private String policyType;
    private Status status;
    private PayoutType payoutType;
    private String description;
    private String customerName;
    private String customerPhone;
    private List<String> evidenceUrls;
    private String adjusterNotes;
    private LocalDateTime createdAt;

    public static ClaimResponse fromEntity(Claim claim) {
        return ClaimResponse.builder()
                .id(claim.getId())
                .policyId(claim.getPolicy().getId())
                .policyType(claim.getPolicy().getProductType().name())
                .customerName(claim.getPolicy().getUser().getFullName())
                .customerPhone(claim.getPolicy().getUser().getPhoneNumber())
                .status(claim.getStatus())
                .payoutType(claim.getPayoutType())
                .description(claim.getDescription())
                .evidenceUrls(claim.getEvidenceUrls() != null && !claim.getEvidenceUrls().isBlank() ? List.of(claim.getEvidenceUrls().split(",")) : List.of())
                .adjusterNotes(claim.getAdjusterNotes())
                .createdAt(claim.getCreatedAt())
                .build();
    }
}
