package com.undawriter.insure.models;

import lombok.Data;

@Data
public class ClaimMessageRequest {
    private String message;
    private Long parentId;
}
