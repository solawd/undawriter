package com.undawriter.insure.security;

import com.undawriter.insure.models.User;
import com.undawriter.insure.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Find users with unhashed passwords (not starting with $2a$)
        List<User> unhashedUsers = userRepository.findAll().stream()
                .filter(u -> !u.getPasswordHash().startsWith("$2a$"))
                .toList();

        for (User user : unhashedUsers) {
            user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
            userRepository.save(user);
        }
    }
}
