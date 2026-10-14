package com.barangay.eservices.modules.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiVisionVerificationResponse {

    private String detectedClass;
    private String classDescription;
    private double confidence;
    private boolean validDocument;
    private boolean twoByTwo;
    private double aspectRatio;
    private double blurScore;
    private boolean sharp;
    private String qualityAssessment;
    private String userMessage;
    private double latencyMs;
    private Map<String, Double> classProbabilities;
}
