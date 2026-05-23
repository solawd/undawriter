package com.undawriter.insure.services;

import com.undawriter.insure.models.MotorDetails;
import com.undawriter.insure.models.Policy;
import com.undawriter.insure.models.User;
import com.undawriter.insure.repositories.MotorDetailsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentGenerationService {

    private final TemplateEngine templateEngine;
    private final MotorDetailsRepository motorDetailsRepository;

    private static final String UPLOAD_DIR = "./uploads/";

    /**
     * Generates the PDF documents and returns their paths.
     * index 0 = policy path, index 1 = sticker path
     */
    public String[] generateDocuments(Policy policy, User user, String signatureBase64) throws Exception {
        // Ensure upload directory exists
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        MotorDetails motorDetails = motorDetailsRepository.findByPolicyId(policy.getId()).orElse(null);

        // Convert base64 signature to a temporary file because Flying Saucer cannot handle data: URIs natively
        String base64Data = signatureBase64.contains(",") ? signatureBase64.split(",")[1] : signatureBase64;
        byte[] decodedBytes = java.util.Base64.getDecoder().decode(base64Data);
        File tempImage = File.createTempFile("signature_", ".png");
        Files.write(tempImage.toPath(), decodedBytes);
        String signatureFileUrl = tempImage.toURI().toString();

        Context context = new Context();
        context.setVariable("policy", policy);
        context.setVariable("user", user);
        context.setVariable("motor", motorDetails);
        context.setVariable("signatureUrl", signatureFileUrl);

        // 1. Generate Policy Document
        String policyHtml = templateEngine.process("documents/policy-document", context);
        String policyFileName = "policy_" + policy.getId() + "_" + UUID.randomUUID().toString() + ".pdf";
        String policyLocalPath = UPLOAD_DIR + policyFileName;
        generatePdfFromHtml(policyHtml, policyLocalPath);

        // 2. Generate Sticker Document
        String stickerHtml = templateEngine.process("documents/sticker", context);
        String stickerFileName = "sticker_" + policy.getId() + "_" + UUID.randomUUID().toString() + ".pdf";
        String stickerLocalPath = UPLOAD_DIR + stickerFileName;
        generatePdfFromHtml(stickerHtml, stickerLocalPath);

        return new String[]{"/uploads/" + policyFileName, "/uploads/" + stickerFileName};
    }

    private void generatePdfFromHtml(String html, String outputFilePath) throws Exception {
        try (OutputStream outputStream = new FileOutputStream(outputFilePath)) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(outputStream);
        }
    }
}
