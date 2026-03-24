package com.undawriter.insure.services;

import com.undawriter.insure.models.Policy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Slf4j
public class NicMidService {

    // Simulates calling the NIC MID API
    public String generateSticker(Policy policy) {
        log.info("Calling NIC MID API to generate sticker for Policy ID: {}", policy.getId());
        // Mock ID
        String mockStickerId = "NIC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        log.info("Successfully received Sticker ID: {}", mockStickerId);
        return mockStickerId;
    }
}
