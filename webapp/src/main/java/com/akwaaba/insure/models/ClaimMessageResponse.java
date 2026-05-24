package com.undawriter.insure.models;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ClaimMessageResponse {
    private Long id;
    private Long claimId;
    private Long userId;
    private String userFullName;
    private User.Profile userProfile;
    private Long parentId;
    private String message;
    private LocalDateTime createdAt;

    public static ClaimMessageResponse fromEntity(ClaimMessage message) {
        return ClaimMessageResponse.builder()
                .id(message.getId())
                .claimId(message.getClaim().getId())
                .userId(message.getUser().getId())
                .userFullName(message.getUser().getFullName())
                .userProfile(message.getUser().getProfile())
                .parentId(message.getParent() != null ? message.getParent().getId() : null)
                .message(message.getMessage())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
