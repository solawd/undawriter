package com.undawriter.insure.models;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class QuoteResponse {
    private BigDecimal basePremium;
    private BigDecimal nicLevy;
    private BigDecimal stickerFee;
    private BigDecimal totalPremium;
    private String currency;
}
