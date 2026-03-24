package com.undawriter.insure.models;

import lombok.Data;
import java.math.BigDecimal;
import com.undawriter.insure.models.Policy.ProductType;

@Data
public class QuoteRequest {
    private ProductType productType;
    
    // Motor
    private BigDecimal sumInsured;
    
    // Home
    private BigDecimal buildingValue;
    private BigDecimal contentValue;
    
    // Travel
    private Integer tripDays;
    private Integer age;
    private TravelDetails.Region region;
}
