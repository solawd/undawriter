package com.undawriter.insure.services;

import com.undawriter.insure.models.Policy;
import com.undawriter.insure.models.Transaction;
import com.undawriter.insure.models.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;

    @Value("${undawriter.mail.from}")
    private String fromEmail;

    @Async
    public void sendSignupEmail(User user) {
        log.info("Sending signup email to {}", user.getEmail());
        try {
            Context context = new Context();
            context.setVariable("name", user.getFullName());

            String htmlBody = templateEngine.process("emails/signup", context);
            sendHtmlEmail(user.getEmail(), "Welcome to UndaWriter Insure!", htmlBody);

            log.info("Signup email sent successfully to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send signup email to {}", user.getEmail(), e);
        }
    }

    @Async
    public void sendTransactionSuccessEmail(User user, Policy policy, Transaction transaction, String policyPath, String stickerPath) {
        log.info("Sending transaction success email to {}", user.getEmail());
        try {
            Context context = new Context();
            context.setVariable("name", user.getFullName());
            context.setVariable("policyId", policy.getId());
            context.setVariable("amount", transaction.getAmount());
            context.setVariable("productType", policy.getProductType().name());
            context.setVariable("startDate", policy.getStartDate());
            context.setVariable("endDate", policy.getEndDate());

            String htmlBody = templateEngine.process("emails/transaction-success", context);
            
            sendHtmlEmailWithAttachments(user.getEmail(), "Your UndaWriter Policy Purchase is Successful", htmlBody, policyPath, stickerPath);

            log.info("Transaction success email sent successfully to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send transaction success email to {}", user.getEmail(), e);
        }
    }

    private void sendHtmlEmailWithAttachments(String to, String subject, String htmlBody, String... attachmentPaths) throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);

        for (String path : attachmentPaths) {
            if (path != null && !path.isEmpty()) {
                java.io.File file = new java.io.File(path);
                if (file.exists()) {
                    helper.addAttachment(file.getName(), file);
                }
            }
        }

        javaMailSender.send(message);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);

        javaMailSender.send(message);
    }
}
