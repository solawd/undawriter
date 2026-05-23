package com.undawriter.insure.models;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PurchaseMotorRequest {
    private String regNumber;
    private String chassisNumber;
    private String makeModel;
    private Integer year;
    private String bodyType;
    private Integer seatingCapacity;
    private String usage;
    private String coverageType;
    private BigDecimal sumInsured;
    private Integer durationMonths;
    private BigDecimal totalPremium; // The amount to charge
    
    // Payment specific fields
    private String paymentChannel; // e.g., MOBILE_MONEY, CARD
    private String paymentReference;
    private String mobileNetwork;
    private String mobileNumber;
    private String cardNumber;
}
