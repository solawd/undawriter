package com.undawriter.insure.controllers;

import com.undawriter.insure.models.Policy;
import com.undawriter.insure.models.SignatureRequest;
import com.undawriter.insure.models.Transaction;
import com.undawriter.insure.models.User;
import com.undawriter.insure.repositories.PolicyRepository;
import com.undawriter.insure.repositories.TransactionRepository;
import com.undawriter.insure.services.DocumentGenerationService;
import com.undawriter.insure.services.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import com.undawriter.insure.repositories.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/policies")
@RequiredArgsConstructor
public class SignatureController {

    private final PolicyRepository policyRepository;
    private final TransactionRepository transactionRepository;
    private final DocumentGenerationService documentGenerationService;
    private final EmailService emailService;
    private final UserRepository userRepository;

    @PostMapping("/{policyId}/sign")
    public ResponseEntity<?> signPolicy(
            @PathVariable Long policyId,
            @RequestBody SignatureRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        if (!policy.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Access denied");
        }

        try {
            // Generate PDFs
            String[] docUrls = documentGenerationService.generateDocuments(policy, user, request.getSignatureBase64());
            
            // Save URLs in policy
            policy.setPolicyDocumentUrl(docUrls[0]);
            policy.setStickerDocumentUrl(docUrls[1]);
            policyRepository.save(policy);

            // Fetch transaction to send email
            Transaction transaction = transactionRepository.findByPolicyId(policy.getId())
                    .stream()
                    .filter(t -> t.getType() == Transaction.Type.PAYMENT && t.getStatus() == Transaction.Status.SUCCESS)
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No successful payment found for policy"));

            // Convert URL (/uploads/file.pdf) to local path (./uploads/file.pdf)
            String policyLocalPath = "." + docUrls[0];
            String stickerLocalPath = "." + docUrls[1];

            emailService.sendTransactionSuccessEmail(user, policy, transaction, policyLocalPath, stickerLocalPath);

            return ResponseEntity.ok().body("{\"message\": \"Signed successfully\"}");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to generate documents");
        }
    }
}
