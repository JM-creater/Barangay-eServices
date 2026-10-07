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
public class AiPredictionResponse {

    private String serviceCode;
    private String serviceName;
    private Double fee;

    /**
     * Predicted hours until ready for release.
     */
    private Double predictedTurnaroundHours;

    /**
     * Predicted turnaround in fractional working days.
     */
    private Double predictedTurnaroundDays;

    /**
     * Assessment Category:
     * - READY_FOR_APPROVAL (Fast-track candidate)
     * - STANDARD_REVIEW (Normal administrative queue)
     * - NEEDS_CORRECTION_RISK (Incomplete or unclear documentation)
     */
    private String assessmentCategory;

    /**
     * Model confidence score between 0.0 and 1.0.
     */
    private Double confidenceScore;

    /**
     * Indicates whether the application meets fast-track issuance criteria.
     */
    private Boolean fastTrackEligible;

    /**
     * Risk rating: LOW, MEDIUM, HIGH.
     */
    private String riskLevel;

    /**
     * Actionable AI recommendations for applicant and staff.
     */
    private List<String> aiRecommendations;

    /**
     * Latency of in-memory execution in milliseconds (typically < 1ms).
     */
    private Long inferenceLatencyMs;

    /**
     * Source of execution: "ONNX_IN_MEMORY" or "INTELLIGENT_HEURISTIC_FALLBACK".
     */
    private String executionEngine;
}
