package com.lifelens.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class DecisionResponse {

    private Long id;
    private String title;
    private String category;
    private String description;
    private Map<String, Double> criteria;
    private List<RankedOption> rankedOptions;
    private String recommendation;
    private Double recommendedScore;
    private Double marginOfVictory;
    private Boolean isTied;
    private String aiExplanation;
    private LocalDateTime createdAt;

    public DecisionResponse() {
    }

    public static class RankedOption {
        private String name;
        private Double score;
        private Integer rank;
        private Double percentageScore;
        private Map<String, Double> rawScores;

        public RankedOption() {
        }

        public RankedOption(String name, Double score, Integer rank, Double percentageScore, Map<String, Double> rawScores) {
            this.name = name;
            this.score = score;
            this.rank = rank;
            this.percentageScore = percentageScore;
            this.rawScores = rawScores;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Double getScore() {
            return score;
        }

        public void setScore(Double score) {
            this.score = score;
        }

        public Integer getRank() {
            return rank;
        }

        public void setRank(Integer rank) {
            this.rank = rank;
        }

        public Double getPercentageScore() {
            return percentageScore;
        }

        public void setPercentageScore(Double percentageScore) {
            this.percentageScore = percentageScore;
        }

        public Map<String, Double> getRawScores() {
            return rawScores;
        }

        public void setRawScores(Map<String, Double> rawScores) {
            this.rawScores = rawScores;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public List<RankedOption> getRankedOptions() {
        return rankedOptions;
    }

    public void setRankedOptions(List<RankedOption> rankedOptions) {
        this.rankedOptions = rankedOptions;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public Double getRecommendedScore() {
        return recommendedScore;
    }

    public void setRecommendedScore(Double recommendedScore) {
        this.recommendedScore = recommendedScore;
    }

    public Double getMarginOfVictory() {
        return marginOfVictory;
    }

    public void setMarginOfVictory(Double marginOfVictory) {
        this.marginOfVictory = marginOfVictory;
    }

    public Boolean getIsTied() {
        return isTied;
    }

    public void setIsTied(Boolean tied) {
        isTied = tied;
    }

    public String getAiExplanation() {
        return aiExplanation;
    }

    public void setAiExplanation(String aiExplanation) {
        this.aiExplanation = aiExplanation;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
