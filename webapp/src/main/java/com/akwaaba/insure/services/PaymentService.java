package com.undawriter.insure.services;

import com.undawriter.insure.models.Policy;
import com.undawriter.insure.models.MotorDetails;
import com.undawriter.insure.models.PurchaseMotorRequest;
import com.undawriter.insure.models.Transaction;
import com.undawriter.insure.models.User;
import com.undawriter.insure.repositories.MotorDetailsRepository;
import com.undawriter.insure.repositories.PolicyRepository;
import com.undawriter.insure.repositories.TransactionRepository;
import com.undawriter.insure.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentService {
    
    private final PolicyRepository policyRepository;
    private final NicMidService nicMidService;
    private final UserRepository userRepository;
    private final MotorDetailsRepository motorDetailsRepository;
    private final TransactionRepository transactionRepository;
    private final EmailService emailService;

    // Simulates sending request to Paystack to get checkout URL
    public String initializePayment(Long policyId) {
        log.info("Initializing payment for Policy ID: {}", policyId);
        // Mock Paystack URL
        return "https://checkout.paystack.com/pay/" + UUID.randomUUID().toString().substring(0, 8);
    }

    // Webhook receiver for successful payments
    public void processPaymentSuccess(Long policyId, String reference) {
        log.info("Processing successful payment for Policy ID: {}, Reference: {}", policyId, reference);
        
        policyRepository.findById(policyId).ifPresent(policy -> {
            // Idempotency check 
            if (policy.getStatus() == Policy.Status.ACTIVE) {
                log.info("Policy {} is already active. Ignoring webhook.", policyId);
                return;
            }

            policy.setStatus(Policy.Status.ACTIVE);
            policy.setTotalPaid(policy.getPremiumNet());
            
            if (policy.getProductType() == Policy.ProductType.MOTOR) {
                // Issue NIC Sticker
                String stickerId = nicMidService.generateSticker(policy);
                policy.setNicStickerId(stickerId);
            }
            
            policyRepository.save(policy);
            log.info("Policy {} marked as ACTIVE", policyId);
        });
    }

    @Transactional
    public Policy purchaseMotorPolicy(String userEmail, PurchaseMotorRequest request) {
        log.info("Processing instant motor purchase for {}", userEmail);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        // Create Policy
        Policy policy = Policy.builder()
                .user(user)
                .productType(Policy.ProductType.MOTOR)
                .status(Policy.Status.ACTIVE)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(request.getDurationMonths()))
                .premiumNet(request.getTotalPremium())
                .totalPaid(request.getTotalPremium())
                .build();
        
        // Generate mock NIC sticker directly as per requirement to bypass external integrations,
        // (but we still issue it locally)
        String stickerId = nicMidService.generateSticker(policy);
        policy.setNicStickerId(stickerId);
        
        policy = policyRepository.save(policy);

        // Create Motor Details
        MotorDetails motorDetails = MotorDetails.builder()
                .policy(policy)
                .regNumber(request.getRegNumber())
                .chassisNumber(request.getChassisNumber())
                .makeModel(request.getMakeModel())
                .year(request.getYear())
                .bodyType(request.getBodyType())
                .seatingCapacity(request.getSeatingCapacity())
                .usage(MotorDetails.Usage.valueOf(request.getUsage().toUpperCase()))
                .coverageType(MotorDetails.CoverageType.valueOf(request.getCoverageType().replace(" ", "_").toUpperCase()))
                .sumInsured(request.getSumInsured())
                .build();
        motorDetailsRepository.save(motorDetails);

        String cardLast4 = null;
        if (request.getCardNumber() != null && request.getCardNumber().length() >= 4) {
            cardLast4 = request.getCardNumber().substring(request.getCardNumber().length() - 4);
        }

        String txReference = request.getPaymentReference() != null && !request.getPaymentReference().isEmpty() 
            ? request.getPaymentReference() 
            : "INSTANT_" + UUID.randomUUID().toString().substring(0, 8);

        // Create Transaction
        Transaction transaction = Transaction.builder()
                .user(user)
                .policy(policy)
                .amount(request.getTotalPremium())
                .type(Transaction.Type.PAYMENT)
                .status(Transaction.Status.SUCCESS)
                .reference(txReference)
                .paymentChannel(request.getPaymentChannel())
                .mobileNetwork(request.getMobileNetwork())
                .mobileNumber(request.getMobileNumber())
                .cardLast4(cardLast4)
                .build();
        transactionRepository.save(transaction);

        // Email is now sent after the user signs the document in SignatureController
        
        return policy;
    }
}
