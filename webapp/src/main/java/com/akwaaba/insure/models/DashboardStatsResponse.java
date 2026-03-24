package com.undawriter.insure.models;

import lombok.Data;
import lombok.Builder;

import java.util.List;

@Data
@Builder
public class DashboardStatsResponse {
    private List<DailyPolicyCount> weeklyPolicyPurchases;
    private long pendingClaimsCount;
    private long rejectedClaimsCount;
    private long successfulClaimsCount;

    @Data
    @Builder
    public static class DailyPolicyCount {
        private String date; // "Mon", "Tue" OR "2026-03-10"
        private long count;
    }
}
