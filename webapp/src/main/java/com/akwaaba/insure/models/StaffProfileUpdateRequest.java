package com.undawriter.insure.models;

import lombok.Data;

@Data
public class StaffProfileUpdateRequest {
    private String fullName;
    private String phoneNumber;
    private String currentPassword;
    private String newPassword;
}
