package com.lifelens;

import com.lifelens.dto.DecisionRequest;
import com.lifelens.dto.DecisionResponse.RankedOption;
import com.lifelens.service.DecisionMatrixService;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class DecisionMatrixServiceTest {

    private final DecisionMatrixService service = new DecisionMatrixService();

    @Test
    void testWeightedScoringAndRanking() {
        // Criteria: Salary (weight 8), Work-Life Balance (weight 6)
        Map<String, Double> criteria = Map.of(
                "Salary", 8.0,
                "WorkLifeBalance", 6.0
        );

        // Option A: high salary (9.0), low balance (4.0)
        // Option B: moderate salary (7.0), high balance (9.0)
        DecisionRequest.OptionInput optA = new DecisionRequest.OptionInput("Job Offer A", Map.of(
                "Salary", 9.0,
                "WorkLifeBalance", 4.0
        ));

        DecisionRequest.OptionInput optB = new DecisionRequest.OptionInput("Job Offer B", Map.of(
                "Salary", 7.0,
                "WorkLifeBalance", 9.0
        ));

        List<RankedOption> results = service.evaluateOptions(criteria, List.of(optA, optB));

        assertNotNull(results);
        assertEquals(2, results.size());

        // Calculation:
        // Total weight = 14
        // Opt A: (8*9 + 6*4) / 14 = (72 + 24) / 14 = 96 / 14 = 6.86
        // Opt B: (8*7 + 6*9) / 14 = (56 + 54) / 14 = 110 / 14 = 7.86
        // Option B should be ranked #1
        assertEquals("Job Offer B", results.get(0).getName());
        assertEquals(1, results.get(0).getRank());
        assertTrue(results.get(0).getScore() > results.get(1).getScore());
    }
}
