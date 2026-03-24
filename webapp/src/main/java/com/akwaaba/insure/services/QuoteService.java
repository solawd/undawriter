package com.undawriter.insure.services;

import com.undawriter.insure.models.QuoteRequest;
import com.undawriter.insure.models.QuoteResponse;
import com.undawriter.insure.models.TravelDetails.Region;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class QuoteService {

    private static final BigDecimal NIC_LEVY_RATE = new BigDecimal("0.015"); // 1.5%
    private static final BigDecimal MOTOR_STICKER_FEE = new BigDecimal("1.50");
    private static final BigDecimal MOTOR_BASE_RATE = new BigDecimal("0.05"); // 5% of sum insured
    
    private static final BigDecimal HOME_BASE_RATE = new BigDecimal("0.0025"); // 0.25%

    private static final BigDecimal TRAVEL_DAILY_RATE = new BigDecimal("15.00");

    public QuoteResponse calculateQuote(QuoteRequest request) {
        return switch (request.getProductType()) {
            case MOTOR -> calculateMotorQuote(request.getSumInsured());
            case HOME -> calculateHomeQuote(request.getBuildingValue(), request.getContentValue());
            case TRAVEL -> calculateTravelQuote(request.getTripDays(), request.getRegion(), request.getAge());
        };
    }

    private QuoteResponse calculateMotorQuote(BigDecimal sumInsured) {
        if (sumInsured == null) sumInsured = BigDecimal.ZERO;
        BigDecimal basePremium = sumInsured.multiply(MOTOR_BASE_RATE);
        BigDecimal nicLevy = basePremium.multiply(NIC_LEVY_RATE);
        BigDecimal total = basePremium.add(nicLevy).add(MOTOR_STICKER_FEE).setScale(2, RoundingMode.HALF_UP);
        
        return QuoteResponse.builder()
                .basePremium(basePremium.setScale(2, RoundingMode.HALF_UP))
                .nicLevy(nicLevy.setScale(2, RoundingMode.HALF_UP))
                .stickerFee(MOTOR_STICKER_FEE)
                .totalPremium(total)
                .currency("GHS")
                .build();
    }

    private QuoteResponse calculateHomeQuote(BigDecimal building, BigDecimal content) {
        if (building == null) building = BigDecimal.ZERO;
        if (content == null) content = BigDecimal.ZERO;
        
        BigDecimal totalValue = building.add(content);
        BigDecimal basePremium = totalValue.multiply(HOME_BASE_RATE);
        BigDecimal total = basePremium.setScale(2, RoundingMode.HALF_UP);

        return QuoteResponse.builder()
                .basePremium(total)
                .nicLevy(BigDecimal.ZERO)
                .stickerFee(BigDecimal.ZERO)
                .totalPremium(total)
                .currency("GHS")
                .build();
    }

    private QuoteResponse calculateTravelQuote(Integer days, Region region, Integer age) {
        if (days == null) days = 1;
        if (age == null) age = 30;
        
        BigDecimal regionMultiplier = switch (region) {
            case SCHENGEN -> new BigDecimal("1.5");
            case WORLDWIDE -> new BigDecimal("2.0");
            case AFRICA -> new BigDecimal("1.0");
        };
        
        BigDecimal ageFactor = (age > 65) ? new BigDecimal("1.5") : new BigDecimal("1.0");
        
        BigDecimal basePremium = TRAVEL_DAILY_RATE.multiply(new BigDecimal(days))
                .multiply(regionMultiplier)
                .multiply(ageFactor);
                
        BigDecimal total = basePremium.setScale(2, RoundingMode.HALF_UP);

        return QuoteResponse.builder()
                .basePremium(total)
                .nicLevy(BigDecimal.ZERO)
                .stickerFee(BigDecimal.ZERO)
                .totalPremium(total)
                .currency("GHS")
                .build();
    }
}
