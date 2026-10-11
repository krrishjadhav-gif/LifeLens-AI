package com.lifelens.service;

import com.lifelens.dto.DecisionRequest;
import com.lifelens.dto.DecisionResponse.RankedOption;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class DecisionMatrixService {

    public List<RankedOption> evaluateOptions(Map<String, Double> criteriaWeights, List<DecisionRequest.OptionInput> options) {
        if (options == null || options.isEmpty()) {
            return Collections.emptyList();
        }

        // Calculate total weight to normalize criteria
        double totalWeight = 0.0;
        if (criteriaWeights != null) {
            for (Double w : criteriaWeights.values()) {
                if (w != null && w > 0) {
                    totalWeight += w;
                }
            }
        }

        Map<String, Double> normalizedWeights = new HashMap<>();
        if (criteriaWeights != null && !criteriaWeights.isEmpty()) {
            int criteriaCount = criteriaWeights.size();
            for (Map.Entry<String, Double> entry : criteriaWeights.entrySet()) {
                double rawW = (entry.getValue() != null && entry.getValue() > 0) ? entry.getValue() : 1.0;
                double normalized = (totalWeight > 0) ? (rawW / totalWeight) : (1.0 / criteriaCount);
                normalizedWeights.put(entry.getKey(), normalized);
            }
        }

        List<RankedOption> evaluated = new ArrayList<>();

        for (DecisionRequest.OptionInput opt : options) {
            String name = opt.getName();
            Map<String, Double> scores = opt.getScores() != null ? opt.getScores() : Collections.emptyMap();

            double weightedScore = 0.0;
            for (Map.Entry<String, Double> cEntry : normalizedWeights.entrySet()) {
                String critName = cEntry.getKey();
                double weight = cEntry.getValue();
                double score = scores.getOrDefault(critName, 5.0); // Default neutral score 5.0 if not specified
                weightedScore += (weight * score);
            }

            // Round weighted score to 2 decimal places
            double roundedScore = round(weightedScore, 2);
            // Percentage relative to a 10-point scale (standard 1-10 rating)
            double percentage = round(Math.min(100.0, Math.max(0.0, (roundedScore / 10.0) * 100.0)), 1);

            evaluated.add(new RankedOption(name, roundedScore, 1, percentage, scores));
        }

        // Sort descending by score
        evaluated.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));

        // Assign ranks (handle ties)
        for (int i = 0; i < evaluated.size(); i++) {
            if (i > 0) {
                if (Math.abs(evaluated.get(i).getScore() - evaluated.get(i - 1).getScore()) < 0.001) {
                    evaluated.get(i).setRank(evaluated.get(i - 1).getRank());
                } else {
                    evaluated.get(i).setRank(i + 1);
                }
            } else {
                evaluated.get(i).setRank(1);
            }
        }

        return evaluated;
    }

    private double round(double value, int places) {
        if (places < 0) throw new IllegalArgumentException();
        BigDecimal bd = BigDecimal.valueOf(value);
        bd = bd.setScale(places, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }
}
