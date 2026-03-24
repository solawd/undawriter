package com.undawriter.insure;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class InsureApplication {

	public static void main(String[] args) {
		SpringApplication.run(InsureApplication.class, args);
	}

	@Bean
	public CommandLineRunner printHash(PasswordEncoder encoder) {
		return args -> {
			String rawPassword = "password123";
			String existingHash = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
			boolean matches = encoder.matches(rawPassword, existingHash);
			System.out.println("BCRYPT_DEBUG - DOES PASSWORD MATCH HASH?: " + matches);
			System.out.println("BCRYPT_DEBUG - GENERATED NEW HASH FOR REFERENCE: " + encoder.encode(rawPassword));
		};
	}
}
