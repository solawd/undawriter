package com.undawriter.insure;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class BcryptTest {
    @Test
    public void testPasswordMatch() {
        PasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "password123";
        String existingHash = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
        
        System.out.println("BCRYPT_DEBUG - DOES PASSWORD MATCH HASH?: " + encoder.matches(rawPassword, existingHash));
        System.out.println("BCRYPT_DEBUG - NEW HASH: " + encoder.encode(rawPassword));
        assertTrue(encoder.matches(rawPassword, existingHash));
    }
}
