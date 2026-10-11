package com.lifelens.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Map;

public class DecisionRequest {

    @NotBlank(message = "Decision title is required")
    private String title;

    private String category;
    private String description;

    @NotEmpty(message = "At least one criterion is required")
    private Map<String, Double> criteria;

    @NotEmpty(message = "At least two alternatives are required")
    @Size(min = 2, message = "At least two alternatives are required to make a decision")
    private List<OptionInput> options;

    public DecisionRequest() {
    }

    public static class OptionInput {

        @NotBlank(message = "Alternative name is required")
        private String name;

        private Map<String, Double> scores;

        public OptionInput() {
        }

        public OptionInput(String name, Map<String, Double> scores) {
            this.name = name;
            this.scores = scores;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Map<String, Double> getScores() {
            return scores;
        }

        public void setScores(Map<String, Double> scores) {
            this.scores = scores;
        }
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Map<String, Double> getCriteria() {
        return criteria;
    }

    public void setCriteria(Map<String, Double> criteria) {
        this.criteria = criteria;
    }

    public List<OptionInput> getOptions() {
        return options;
    }

    public void setOptions(List<OptionInput> options) {
        this.options = options;
    }
}
