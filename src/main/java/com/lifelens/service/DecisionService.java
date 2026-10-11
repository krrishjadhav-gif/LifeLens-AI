package com.lifelens.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifelens.dto.DecisionRequest;
import com.lifelens.dto.DecisionResponse;
import com.lifelens.dto.DecisionResponse.RankedOption;
import com.lifelens.entity.Decision;
import com.lifelens.repository.DecisionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class DecisionService {

    private static final Logger logger = LoggerFactory.getLogger(DecisionService.class);

    private final DecisionRepository decisionRepository;
    private final DecisionMatrixService decisionMatrixService;
    private final GeminiAiService geminiAiService;
    private final ObjectMapper objectMapper;

    public DecisionService(DecisionRepository decisionRepository,
                           DecisionMatrixService decisionMatrixService,
                           GeminiAiService geminiAiService,
                           ObjectMapper objectMapper) {
        this.decisionRepository = decisionRepository;
        this.decisionMatrixService = decisionMatrixService;
        this.geminiAiService = geminiAiService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public DecisionResponse createAndEvaluateDecision(DecisionRequest request) {
        // 1. Evaluate options mathematically using weighted criteria
        List<RankedOption> rankedOptions = decisionMatrixService.evaluateOptions(
                request.getCriteria(),
                request.getOptions()
        );

        RankedOption winner = !rankedOptions.isEmpty() ? rankedOptions.get(0) : null;
        RankedOption runnerUp = rankedOptions.size() > 1 ? rankedOptions.get(1) : null;

        double marginOfVictory = 0.0;
        boolean isTied = false;
        if (winner != null && runnerUp != null) {
            marginOfVictory = Math.round((winner.getScore() - runnerUp.getScore()) * 100.0) / 100.0;
            isTied = marginOfVictory <= 0.01;
        }

        // 2. Generate AI Explanation
        String explanation = geminiAiService.generateDecisionExplanation(
                request.getTitle(),
                request.getDescription(),
                request.getCriteria(),
                rankedOptions
        );

        // 3. Persist in MySQL Database
        Decision entity = new Decision();
        entity.setTitle(request.getTitle());
        entity.setCategory(request.getCategory());
        entity.setDescription(request.getDescription());
        entity.setRecommendation(winner != null ? winner.getName() : "N/A");
        entity.setRecommendedScore(winner != null ? winner.getScore() : 0.0);
        entity.setAiExplanation(explanation);

        try {
            entity.setCriteriaJson(objectMapper.writeValueAsString(request.getCriteria()));
            entity.setOptionsJson(objectMapper.writeValueAsString(request.getOptions()));
            entity.setResultJson(objectMapper.writeValueAsString(rankedOptions));
        } catch (Exception e) {
            logger.warn("Could not serialize JSON fields: {}", e.getMessage());
        }

        Decision saved = decisionRepository.save(entity);

        // 4. Build and return Response DTO
        DecisionResponse response = new DecisionResponse();
        response.setId(saved.getId());
        response.setTitle(saved.getTitle());
        response.setCategory(saved.getCategory());
        response.setDescription(saved.getDescription());
        response.setCriteria(request.getCriteria());
        response.setRankedOptions(rankedOptions);
        response.setRecommendation(saved.getRecommendation());
        response.setRecommendedScore(saved.getRecommendedScore());
        response.setMarginOfVictory(marginOfVictory);
        response.setIsTied(isTied);
        response.setAiExplanation(saved.getAiExplanation());
        response.setCreatedAt(saved.getCreatedAt());

        return response;
    }

    @Transactional(readOnly = true)
    public List<DecisionResponse> getAllDecisions() {
        List<Decision> list = decisionRepository.findAllByOrderByCreatedAtDesc();
        List<DecisionResponse> responses = new ArrayList<>();
        for (Decision d : list) {
            responses.add(mapEntityToResponse(d));
        }
        return responses;
    }

    @Transactional(readOnly = true)
    public Optional<DecisionResponse> getDecisionById(Long id) {
        return decisionRepository.findById(id).map(this::mapEntityToResponse);
    }

    @Transactional
    public boolean deleteDecision(Long id) {
        if (decisionRepository.existsById(id)) {
            decisionRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private DecisionResponse mapEntityToResponse(Decision d) {
        DecisionResponse dto = new DecisionResponse();
        dto.setId(d.getId());
        dto.setTitle(d.getTitle());
        dto.setCategory(d.getCategory());
        dto.setDescription(d.getDescription());
        dto.setRecommendation(d.getRecommendation());
        dto.setRecommendedScore(d.getRecommendedScore());
        dto.setAiExplanation(d.getAiExplanation());
        dto.setCreatedAt(d.getCreatedAt());

        try {
            if (d.getCriteriaJson() != null) {
                dto.setCriteria(objectMapper.readValue(d.getCriteriaJson(), new TypeReference<Map<String, Double>>() {}));
            }
            if (d.getResultJson() != null) {
                dto.setRankedOptions(objectMapper.readValue(d.getResultJson(), new TypeReference<List<RankedOption>>() {}));
            }
        } catch (Exception e) {
            logger.warn("Could not deserialize JSON fields for decision {}: {}", d.getId(), e.getMessage());
        }

        if (dto.getRankedOptions() != null && dto.getRankedOptions().size() > 1) {
            double diff = Math.round((dto.getRankedOptions().get(0).getScore() - dto.getRankedOptions().get(1).getScore()) * 100.0) / 100.0;
            dto.setMarginOfVictory(diff);
            dto.setIsTied(diff <= 0.01);
        }

        return dto;
    }
}
