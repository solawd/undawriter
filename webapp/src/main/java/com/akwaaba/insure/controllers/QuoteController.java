package com.undawriter.insure.controllers;

import com.undawriter.insure.models.QuoteRequest;
import com.undawriter.insure.models.QuoteResponse;
import com.undawriter.insure.services.QuoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/quotes")
@RequiredArgsConstructor
public class QuoteController {

    private final QuoteService quoteService;

    @PostMapping("/calculate")
    public ResponseEntity<QuoteResponse> calculateQuote(@RequestBody QuoteRequest request) {
        QuoteResponse response = quoteService.calculateQuote(request);
        return ResponseEntity.ok(response);
    }
}
