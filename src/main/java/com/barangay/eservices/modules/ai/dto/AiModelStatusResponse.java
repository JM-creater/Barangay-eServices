package com.barangay.eservices.modules.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiModelStatusResponse {

    // Turnaround Predictor Model
    private boolean modelLoaded;
    private String modelPath;
    private String version;
    private String runtimeEngine;
    private Long modelSizeBytes;
    private List<String> inputFeatures;
    private List<String> outputClasses;
    private Double accuracyScore;
    private String trainedAt;
    private long totalInferencesProcessed;
    private double averageInferenceLatencyMs;

    // Citizen Assistant NLP Model
    private boolean assistantModelLoaded;
    private String assistantModelPath;
    private String assistantVersion;
    private Long assistantModelSizeBytes;
    private Integer assistantVocabularySize;
    private List<String> assistantIntents;
    private Double assistantAccuracyScore;
    private String assistantTrainedAt;
    private long assistantTotalInferences;
    private double assistantAverageLatencyMs;
}
