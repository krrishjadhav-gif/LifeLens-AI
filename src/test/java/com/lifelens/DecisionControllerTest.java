package com.lifelens;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifelens.dto.DecisionRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class DecisionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("healthy"))
                .andExpect(jsonPath("$.project").value("LifeLens AI"));
    }

    @Test
    void testCreateGetAndDeleteDecisionFlow() throws Exception {
        DecisionRequest request = new DecisionRequest();
        request.setTitle("Integration Test Decision");
        request.setCategory("Tech");
        request.setDescription("Testing complete REST cycle");
        request.setCriteria(Map.of("Speed", 8.0, "Cost", 9.0));
        request.setOptions(List.of(
                new DecisionRequest.OptionInput("Option X", Map.of("Speed", 9.0, "Cost", 7.0)),
                new DecisionRequest.OptionInput("Option Y", Map.of("Speed", 6.0, "Cost", 10.0))
        ));

        // 1. Create Decision
        String responseContent = mockMvc.perform(post("/api/decisions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.title").value("Integration Test Decision"))
                .andExpect(jsonPath("$.rankedOptions", hasSize(2)))
                .andExpect(jsonPath("$.recommendation").isNotEmpty())
                .andExpect(jsonPath("$.aiExplanation").isNotEmpty())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Map<?, ?> responseMap = objectMapper.readValue(responseContent, Map.class);
        Number decisionId = (Number) responseMap.get("id");

        // 2. Get All Decisions
        mockMvc.perform(get("/api/decisions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));

        // 3. Get Single Decision by ID
        mockMvc.perform(get("/api/decisions/" + decisionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(decisionId));

        // 4. Delete Decision
        mockMvc.perform(delete("/api/decisions/" + decisionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Decision deleted successfully"));
    }
}
