package com.undawriter.insure.models;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Data
public class ClaimRequest {
    private Long policyId;
    private Claim.PayoutType payoutType;
    private String description;
    private List<MultipartFile> files; 
}
