package com.lifelens.controller;

import com.lifelens.dto.DecisionRequest;
import com.lifelens.dto.DecisionResponse;
import com.lifelens.service.DecisionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class DecisionController {

    private final DecisionService decisionService;

    public DecisionController(DecisionService decisionService) {
        this.decisionService = decisionService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "project", "LifeLens AI",
                "status", "healthy",
                "backend", "Java 17 / Spring Boot 3.2.5"
        ));
    }

    @PostMapping("/decisions")
    public ResponseEntity<DecisionResponse> createDecision(@Valid @RequestBody DecisionRequest request) {
        DecisionResponse response = decisionService.createAndEvaluateDecision(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/decisions")
    public ResponseEntity<List<DecisionResponse>> getAllDecisions() {
        List<DecisionResponse> list = decisionService.getAllDecisions();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/decisions/{id}")
    public ResponseEntity<DecisionResponse> getDecisionById(@PathVariable Long id) {
        return decisionService.getDecisionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/decisions/{id}")
    public ResponseEntity<Map<String, Object>> deleteDecision(@PathVariable Long id) {
        boolean deleted = decisionService.deleteDecision(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Decision deleted successfully", "id", id));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Decision not found with id: " + id));
        }
    }
}
