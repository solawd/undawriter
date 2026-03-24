package com.undawriter.insure.payload.response;

import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String fullName;
    private String ghanaCardId;
    private String profile;

    public JwtResponse(String accessToken, Long id, String email, String fullName, String ghanaCardId, String profile) {
        this.token = accessToken;
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.ghanaCardId = ghanaCardId;
        this.profile = profile;
    }
}
