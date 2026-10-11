package com.lifelens.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifelens.dto.DecisionResponse.RankedOption;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Service
public class GeminiAiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiAiService.class);

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent}")
    private String apiUrl;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GeminiAiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public String generateDecisionExplanation(String title,
                                              String description,
                                              Map<String, Double> criteria,
                                              List<RankedOption> rankedOptions) {

        if (rankedOptions == null || rankedOptions.isEmpty()) {
            return "No alternatives provided for analysis.";
        }

        // Check if Gemini API Key is provided
        if (apiKey != null && !apiKey.trim().isEmpty()) {
            try {
                String aiText = callGeminiApi(title, description, criteria, rankedOptions);
                if (aiText != null && !aiText.trim().isEmpty()) {
                    return aiText.trim();
                }
            } catch (Exception e) {
                logger.warn("Gemini API call failed, falling back to built-in rule engine: {}", e.getMessage());
            }
        }

        // Built-in intelligent fallback rationale engine
        return generateRuleBasedExplanation(title, description, criteria, rankedOptions);
    }

    private String callGeminiApi(String title,
                                 String description,
                                 Map<String, Double> criteria,
                                 List<RankedOption> rankedOptions) throws Exception {

        String prompt = buildPrompt(title, description, criteria, rankedOptions);

        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> partsMap = Map.of("parts", List.of(textPart));
        Map<String, Object> requestPayload = Map.of("contents", List.of(partsMap));

        String requestBody = objectMapper.writeValueAsString(requestPayload);
        String targetUrl = apiUrl + (apiUrl.contains("?") ? "&" : "?") + "key=" + apiKey.trim();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(targetUrl))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(15))
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            JsonNode rootNode = objectMapper.readTree(response.body());
            JsonNode candidates = rootNode.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    return parts.get(0).path("text").asText();
                }
            }
        } else {
            logger.warn("Gemini API returned status code {}: {}", response.statusCode(), response.body());
        }

        return null;
    }

    private String buildPrompt(String title,
                               String description,
                               Map<String, Double> criteria,
                               List<RankedOption> rankedOptions) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are LifeLens AI, an intelligent personal decision support advisor.\n");
        sb.append("Analyze the following multi-criteria decision evaluation and provide a concise, structured explanation with:\n");
        sb.append("1. **Recommendation Summary**: State the winning choice clearly.\n");
        sb.append("2. **Key Strengths**: Why it won based on criteria weights.\n");
        sb.append("3. **Trade-offs & Considerations**: What sacrifices or alternatives to keep in mind.\n");
        sb.append("4. **Actionable Next Step**: One practical recommendation for the user.\n\n");

        sb.append("Decision Title: ").append(title).append("\n");
        if (description != null && !description.isBlank()) {
            sb.append("Description: ").append(description).append("\n");
        }
        sb.append("Criteria & Weights:\n");
        criteria.forEach((k, v) -> sb.append("- ").append(k).append(": ").append(v).append("/10\n"));

        sb.append("\nEvaluated Rankings:\n");
        for (RankedOption opt : rankedOptions) {
            sb.append("- Rank ").append(opt.getRank()).append(": ")
                    .append(opt.getName()).append(" (Score: ").append(opt.getScore()).append("/10)\n");
        }

        sb.append("\nProvide a warm, empowering, and objective response in markdown.");
        return sb.toString();
    }

    private String generateRuleBasedExplanation(String title,
                                                String description,
                                                Map<String, Double> criteria,
                                                List<RankedOption> rankedOptions) {
        RankedOption winner = rankedOptions.get(0);
        RankedOption runnerUp = rankedOptions.size() > 1 ? rankedOptions.get(1) : null;

        StringBuilder sb = new StringBuilder();
        sb.append("### 🎯 Decision Recommendation\n\n");
        sb.append("Based on the multi-criteria weighted analysis for **\"").append(title).append("\"**, ");
        sb.append("the optimal choice is **").append(winner.getName()).append("** ");
        sb.append("with an overall weighted score of **").append(winner.getScore()).append(" / 10** (").append(winner.getPercentageScore()).append("% alignment).\n\n");

        if (runnerUp != null) {
            double diff = Math.round((winner.getScore() - runnerUp.getScore()) * 100.0) / 100.0;
            if (diff <= 0.05) {
                sb.append("⚠️ **Close Contest:** It is essentially a tie with **").append(runnerUp.getName())
                        .append("** (Score: ").append(runnerUp.getScore()).append("). Review individual criteria closely.\n\n");
            } else {
                sb.append("It outperforms the runner-up **").append(runnerUp.getName())
                        .append("** (Score: ").append(runnerUp.getScore()).append(") by a decisive margin of **")
                        .append(diff).append(" points**.\n\n");
            }
        }

        // Highlight top criteria
        if (criteria != null && !criteria.isEmpty()) {
            String topCriterion = criteria.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse(null);

            if (topCriterion != null) {
                Double winnerScoreOnTop = winner.getRawScores() != null ? winner.getRawScores().get(topCriterion) : null;
                sb.append("#### 💡 Key Drivers\n");
                sb.append("- **Highest Priority Criterion:** \"").append(topCriterion).append("\" (Weight: ")
                        .append(criteria.get(topCriterion)).append("/10).\n");
                if (winnerScoreOnTop != null) {
                    sb.append("- **Winning Performance:** ").append(winner.getName()).append(" scored **")
                            .append(winnerScoreOnTop).append("/10** on this high-priority factor.\n\n");
                }
            }
        }

        sb.append("#### 🚀 Actionable Next Step\n");
        sb.append("Proceed with **").append(winner.getName()).append("**. Validate any potential constraints before final commitment.");
        return sb.toString();
    }
}
