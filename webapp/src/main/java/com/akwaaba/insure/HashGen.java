package com.undawriter.insure;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGen {
    public static void main(String[] args) {
        System.out.println(">>>GENERATED_HASH_START<<<");
        System.out.println(new BCryptPasswordEncoder().encode("password123"));
        System.out.println(">>>GENERATED_HASH_END<<<");
    }
}
