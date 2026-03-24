package com.undawriter.insure.controllers;

import com.undawriter.insure.models.Policy;
import com.undawriter.insure.models.PurchaseMotorRequest;
import com.undawriter.insure.services.PaymentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initialize")
    public ResponseEntity<Map<String, String>> initialize(@RequestBody Map<String, Long> request) {
        Long policyId = request.get("policyId");
        String checkoutUrl = paymentService.initializePayment(policyId);
        return ResponseEntity.ok(Map.of("checkoutUrl", checkoutUrl));
    }

    @PostMapping("/purchase/motor")
    public ResponseEntity<Map<String, Object>> purchaseMotor(Authentication authentication, @RequestBody PurchaseMotorRequest request) {
        String userEmail = authentication.getName(); // JWT authentication filter sets principal name to email
        Policy policy = paymentService.purchaseMotorPolicy(userEmail, request);
        return ResponseEntity.ok(Map.of(
            "message", "Policy purchased successfully!",
            "policyId", policy.getId(),
            "nicStickerId", policy.getNicStickerId()
        ));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(@RequestBody WebhookPayload payload) {
        if ("charge.success".equals(payload.getEvent())) {
            // Assume reference contains our policy ID for simplicity
            try {
                Long policyId = Long.parseLong(payload.getData().getReference());
                paymentService.processPaymentSuccess(policyId, payload.getData().getReference());
            } catch (Exception e) {
                // Log formatting error
            }
        }
        return ResponseEntity.ok().build();
    }
    
    @Data
    static class WebhookPayload {
        private String event;
        private EventData data;
    }
    
    @Data
    static class EventData {
        private String reference;
        private String amount;
    }
}
