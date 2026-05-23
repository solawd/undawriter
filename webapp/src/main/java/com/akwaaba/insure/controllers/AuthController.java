package com.undawriter.insure.controllers;

import com.undawriter.insure.models.User;
import com.undawriter.insure.payload.request.LoginRequest;
import com.undawriter.insure.payload.request.RegisterRequest;
import com.undawriter.insure.payload.response.JwtResponse;
import com.undawriter.insure.repositories.UserRepository;
import com.undawriter.insure.security.jwt.JwtUtils;
import com.undawriter.insure.security.services.UserDetailsImpl;
import com.undawriter.insure.services.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getFullName(),
                userDetails.getGhanaCardId(),
                userDetails.getProfile()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        if (userRepository.existsByGhanaCardId(signUpRequest.getGhanaCardId())) {
            return ResponseEntity.badRequest().body("Error: Ghana Card ID is already in use!");
        }

        // Create new user's account
        User user = User.builder()
                .email(signUpRequest.getEmail())
                .passwordHash(encoder.encode(signUpRequest.getPassword()))
                .fullName(signUpRequest.getFullName())
                .ghanaCardId(signUpRequest.getGhanaCardId())
                .phoneNumber(signUpRequest.getPhoneNumber())
                .build();

        userRepository.save(user);
        
        emailService.sendSignupEmail(user);

        return ResponseEntity.ok("User registered successfully!");
    }
}
