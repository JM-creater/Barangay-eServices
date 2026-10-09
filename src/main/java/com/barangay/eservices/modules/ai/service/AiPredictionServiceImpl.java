package com.barangay.eservices.modules.ai.service;

import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtSession;
import com.barangay.eservices.modules.ai.config.OnnxModelConfig;
import com.barangay.eservices.modules.ai.dto.AiModelStatusResponse;
import com.barangay.eservices.modules.ai.dto.AiPredictionRequest;
import com.barangay.eservices.modules.ai.dto.AiPredictionResponse;
import com.barangay.eservices.modules.catalog.entity.ServiceItem;
import com.barangay.eservices.modules.catalog.repository.ServiceItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;

@Service
public class AiPredictionServiceImpl implements AiPredictionService {

    private static final Logger logger = LoggerFactory.getLogger(AiPredictionServiceImpl.class);

    private final OnnxModelConfig onnxModelConfig;
    private final ServiceItemRepository serviceItemRepository;

    private final ExecutorService predictionExecutor = Executors.newCachedThreadPool(r -> {
        Thread t = new Thread(r, "onnx-prediction-worker");
        t.setDaemon(true);
        return t;
    });

    public AiPredictionServiceImpl(OnnxModelConfig onnxModelConfig, ServiceItemRepository serviceItemRepository) {
        this.onnxModelConfig = onnxModelConfig;
        this.serviceItemRepository = serviceItemRepository;
    }

    @PreDestroy
    public void cleanup() {
        if (predictionExecutor != null) {
            predictionExecutor.shutdownNow();
        }
    }

    @Override
    public AiPredictionResponse predictApplication(AiPredictionRequest request) {
        long startTime = System.nanoTime();

        // 1. Resolve Service details
        ServiceItem serviceItem = null;
        if (request.getServiceId() != null) {
            serviceItem = serviceItemRepository.findById(request.getServiceId()).orElse(null);
        } else if (request.getServiceCode() != null) {
            serviceItem = serviceItemRepository.findByServiceCode(request.getServiceCode()).orElse(null);
        }

        String serviceCode = serviceItem != null ? serviceItem.getServiceCode() : (request.getServiceCode() != null ? request.getServiceCode() : "BC-CLEARANCE");
        String serviceName = serviceItem != null ? serviceItem.getName() : "Barangay Service";
        double fee = serviceItem != null ? serviceItem.getFee().doubleValue() : 50.0;
        int requiredDocs = request.getRequiredDocsCount() != null ? Math.max(1, Math.min(100, request.getRequiredDocsCount())) :
                (serviceItem != null && serviceItem.getRequirements() != null ?
                        (int) serviceItem.getRequirements().stream().filter(r -> Boolean.TRUE.equals(r.getIsMandatory())).count() : 2);
        if (requiredDocs <= 0) requiredDocs = 1;

        int submittedDocs = request.getSubmittedDocsCount() != null ? Math.max(0, Math.min(100, request.getSubmittedDocsCount())) : requiredDocs;

        // Date and time features with defensive range clamping
        LocalDateTime now = LocalDateTime.now();
        int dayOfWeek = request.getSubmissionDayOfWeek() != null ? Math.max(0, Math.min(6, request.getSubmissionDayOfWeek())) : now.getDayOfWeek().getValue() - 1; // 0=Monday
        int hour = request.getSubmissionHour() != null ? Math.max(0, Math.min(23, request.getSubmissionHour())) : now.getHour();

        String purpose = request.getPurpose() != null ? request.getPurpose() : "";
        if (purpose.length() > 500) {
            purpose = purpose.substring(0, 500);
        }
        int purposeLength = purpose.length();
        int purposeCategory = categorizePurpose(purpose);
        int serviceIdNum = mapServiceId(serviceCode);

        // Compute composite domain features
        float completenessRatio = requiredDocs > 0 ? Math.min(1.0f, (float) submittedDocs / requiredDocs) : 1.0f;
        float missingDocs = Math.max(0.0f, (float) (requiredDocs - submittedDocs));
        float isMandatoryFullySatisfied = submittedDocs >= requiredDocs ? 1.0f : 0.0f;
        float isMorningSubmission = hour < 12 ? 1.0f : 0.0f;

        // 12-Feature Vector: [service_id, fee, submitted_docs_count, required_docs_count, completeness_ratio, missing_docs, is_satisfied, day_of_week, hour, is_morning, purpose_length, purpose_category]
        float[] rawFeatures12 = new float[]{
                (float) serviceIdNum,
                (float) fee,
                (float) submittedDocs,
                (float) requiredDocs,
                completenessRatio,
                missingDocs,
                isMandatoryFullySatisfied,
                (float) dayOfWeek,
                (float) hour,
                isMorningSubmission,
                (float) purposeLength,
                (float) purposeCategory
        };

        // 8-Feature Vector fallback for legacy models
        float[] rawFeatures8 = new float[]{
                (float) serviceIdNum,
                (float) fee,
                (float) submittedDocs,
                (float) requiredDocs,
                (float) dayOfWeek,
                (float) hour,
                (float) purposeLength,
                (float) purposeCategory
        };

        String assessmentCategory;
        double confidence;
        double predictedHours;
        String executionEngine;

        if (onnxModelConfig.isModelLoaded()) {
            try {
                OrtEnvironment env = onnxModelConfig.getOrtEnvironment();
                OrtSession session = onnxModelConfig.getOrtSession();

                // Standardize features matching model dimensions
                float[] mean = onnxModelConfig.getScalerMean();
                float[] scale = onnxModelConfig.getScalerScale();
                float[] inputVector;

                if (mean != null && scale != null && mean.length == 12 && scale.length == 12) {
                    inputVector = rawFeatures12.clone();
                    for (int i = 0; i < 12; i++) {
                        float s = scale[i] != 0.0f ? scale[i] : 1.0f;
                        inputVector[i] = (inputVector[i] - mean[i]) / s;
                    }
                } else if (mean != null && scale != null && mean.length == 8 && scale.length == 8) {
                    inputVector = rawFeatures8.clone();
                    for (int i = 0; i < 8; i++) {
                        float s = scale[i] != 0.0f ? scale[i] : 1.0f;
                        inputVector[i] = (inputVector[i] - mean[i]) / s;
                    }
                } else {
                    inputVector = rawFeatures12.clone();
                }

                float[][] tensorData = new float[][]{inputVector};
                CompletableFuture<float[]> future = CompletableFuture.supplyAsync(() -> {
                    try {
                        try (OnnxTensor inputTensor = OnnxTensor.createTensor(env, tensorData)) {
                            String inputName = session.getInputNames().iterator().next();
                            Map<String, OnnxTensor> container = Collections.singletonMap(inputName, inputTensor);

                            try (OrtSession.Result result = session.run(container)) {
                                Object outputObj = result.get(0).getValue();
                                return extractProbabilities(outputObj);
                            }
                        }
                    } catch (Exception ex) {
                        logger.debug("Native ONNX session execution exception: {}", ex.getMessage());
                        return null;
                    }
                }, predictionExecutor);

                float[] probabilities = future.get(2500, TimeUnit.MILLISECONDS);
                if (probabilities == null) {
                    throw new RuntimeException("Null inference probabilities returned from ONNX session");
                }

                int predictedClassIndex = 0;
                float maxProb = -1.0f;
                for (int i = 0; i < probabilities.length; i++) {
                    if (probabilities[i] > maxProb) {
                        maxProb = probabilities[i];
                        predictedClassIndex = i;
                    }
                }

                List<String> classes = onnxModelConfig.getOutputClasses();
                assessmentCategory = (predictedClassIndex < classes.size()) ?
                        classes.get(predictedClassIndex) : "STANDARD_REVIEW";
                confidence = Math.round(maxProb * 100.0) / 100.0;
                predictedHours = calculateTurnaroundHours(serviceCode, submittedDocs, requiredDocs, hour, predictedClassIndex);
                executionEngine = "ONNX_IN_MEMORY";
            } catch (TimeoutException te) {
                logger.warn("Native ONNX turnaround prediction timed out (> 2500ms). Executing intelligent heuristic fallback.");
                assessmentCategory = computeHeuristicAssessment(submittedDocs, requiredDocs, purposeLength);
                confidence = 0.90;
                predictedHours = calculateTurnaroundHours(serviceCode, submittedDocs, requiredDocs, hour, assessmentCategory.equals("READY_FOR_APPROVAL") ? 0 : 1);
                executionEngine = "TIMEOUT_HEURISTIC_FALLBACK";
            } catch (Exception e) {
                logger.warn("Native ONNX inference exception: {}. Executing intelligent heuristic fallback.", e.getMessage());
                assessmentCategory = computeHeuristicAssessment(submittedDocs, requiredDocs, purposeLength);
                confidence = 0.92;
                predictedHours = calculateTurnaroundHours(serviceCode, submittedDocs, requiredDocs, hour, assessmentCategory.equals("READY_FOR_APPROVAL") ? 0 : 1);
                executionEngine = "INTELLIGENT_HEURISTIC_FALLBACK";
            }
        } else {
            // Intelligent heuristic fallback
            assessmentCategory = computeHeuristicAssessment(submittedDocs, requiredDocs, purposeLength);
            confidence = 0.94;
            predictedHours = calculateTurnaroundHours(serviceCode, submittedDocs, requiredDocs, hour, assessmentCategory.equals("READY_FOR_APPROVAL") ? 0 : 1);
            executionEngine = "INTELLIGENT_HEURISTIC_FALLBACK";
        }

        long elapsedNs = System.nanoTime() - startTime;
        long latencyMs = Math.max(1, elapsedNs / 1_000_000);
        onnxModelConfig.recordInference(latencyMs);

        // Derive risk and recommendations
        boolean fastTrack = "READY_FOR_APPROVAL".equals(assessmentCategory);
        String riskLevel = fastTrack ? "LOW" : ("NEEDS_CORRECTION_RISK".equals(assessmentCategory) ? "HIGH" : "MEDIUM");
        List<String> recommendations = generateRecommendations(serviceName, submittedDocs, requiredDocs, assessmentCategory, predictedHours);

        double turnaroundDays = Math.round((predictedHours / 24.0) * 10.0) / 10.0;

        return AiPredictionResponse.builder()
                .serviceCode(serviceCode)
                .serviceName(serviceName)
                .fee(fee)
                .predictedTurnaroundHours(Math.round(predictedHours * 10.0) / 10.0)
                .predictedTurnaroundDays(turnaroundDays)
                .assessmentCategory(assessmentCategory)
                .confidenceScore(confidence)
                .fastTrackEligible(fastTrack)
                .riskLevel(riskLevel)
                .aiRecommendations(recommendations)
                .inferenceLatencyMs(latencyMs)
                .executionEngine(executionEngine)
                .build();
    }

    private float[] extractProbabilities(Object outputObj) {
        if (outputObj instanceof float[][]) {
            return ((float[][]) outputObj)[0];
        } else if (outputObj instanceof float[]) {
            return (float[]) outputObj;
        } else if (outputObj instanceof long[]) {
            long[] labels = (long[]) outputObj;
            float[] probs = new float[3];
            int idx = (int) labels[0];
            if (idx >= 0 && idx < 3) probs[idx] = 1.0f;
            return probs;
        }
        return new float[]{0.33f, 0.34f, 0.33f};
    }

    private String computeHeuristicAssessment(int submitted, int required, int purposeLen) {
        if (submitted < required) {
            return "NEEDS_CORRECTION_RISK";
        }
        if (submitted >= required && purposeLen >= 10) {
            return "READY_FOR_APPROVAL";
        }
        return "STANDARD_REVIEW";
    }

    private double calculateTurnaroundHours(String serviceCode, int submitted, int required, int hour, int classIdx) {
        double baseHours = 24.0;
        if ("BC-BUSINESS".equalsIgnoreCase(serviceCode)) {
            baseHours = 48.0;
        } else if ("BC-INDIGENCY".equalsIgnoreCase(serviceCode)) {
            baseHours = 12.0;
        }

        if (submitted < required) {
            return baseHours + 36.0; // Delayed due to document rectifications
        }

        if (classIdx == 0) {
            // Fast track candidate: submitted in morning hours -> same-day release
            return (hour <= 11) ? Math.max(4.0, baseHours * 0.35) : Math.max(12.0, baseHours * 0.65);
        }

        return baseHours;
    }

    private List<String> generateRecommendations(String serviceName, int submitted, int required, String category, double hours) {
        List<String> recs = new ArrayList<>();
        if ("NEEDS_CORRECTION_RISK".equals(category)) {
            recs.add("Incomplete Documentation: " + submitted + " of " + required + " mandatory requirements provided.");
            recs.add("Please attach all required valid identification or certificates to avoid processing delays.");
            recs.add("Applicant will be prompted for corrective uploads prior to formal officer signing.");
        } else if ("READY_FOR_APPROVAL".equals(category)) {
            recs.add("Fast-Track Ready: All mandatory credentials verified and purpose is clear.");
            recs.add("Expected turnaround is expedited to approximately " + Math.round(hours) + " hours.");
            recs.add("Bring official original documents during your appointment for quick verification.");
        } else {
            recs.add("Standard Verification: Application conforms to standard processing guidelines.");
            recs.add("Estimated completion: approximately " + Math.round(hours) + " hours (1 to 2 business days).");
            recs.add("Staff will review attached documents in the regular administrative queue.");
        }
        return recs;
    }

    private int mapServiceId(String serviceCode) {
        if ("BC-CLEARANCE".equalsIgnoreCase(serviceCode)) return 1;
        if ("BC-INDIGENCY".equalsIgnoreCase(serviceCode)) return 2;
        if ("BC-RESIDENCY".equalsIgnoreCase(serviceCode)) return 3;
        if ("BC-BUSINESS".equalsIgnoreCase(serviceCode)) return 4;
        if ("BC-GOODMORAL".equalsIgnoreCase(serviceCode)) return 5;
        return 1;
    }

    private int categorizePurpose(String purpose) {
        if (purpose == null || purpose.trim().isEmpty()) return 5;
        String p = purpose.toLowerCase();
        if (p.contains("job") || p.contains("work") || p.contains("employment") || p.contains("travel")) return 0;
        if (p.contains("school") || p.contains("scholarship") || p.contains("student") || p.contains("enroll")) return 1;
        if (p.contains("medical") || p.contains("hospital") || p.contains("burial") || p.contains("financial") || p.contains("malasakit")) return 2;
        if (p.contains("business") || p.contains("permit") || p.contains("store") || p.contains("commercial")) return 3;
        if (p.contains("bank") || p.contains("id") || p.contains("passport") || p.contains("legal") || p.contains("court")) return 4;
        return 5;
    }

    @Override
    public AiModelStatusResponse getModelStatus() {
        return AiModelStatusResponse.builder()
                .modelLoaded(onnxModelConfig.isModelLoaded())
                .modelPath(onnxModelConfig.getLoadedModelPath() != null ? onnxModelConfig.getLoadedModelPath() : "Awaiting training (ai/train.py)")
                .version(onnxModelConfig.getVersion())
                .runtimeEngine("Microsoft ONNXRuntime v1.17.1 (JVM In-Memory)")
                .modelSizeBytes(onnxModelConfig.getModelSizeBytes())
                .inputFeatures(onnxModelConfig.getInputFeatures())
                .outputClasses(onnxModelConfig.getOutputClasses())
                .accuracyScore(onnxModelConfig.getAccuracyScore())
                .trainedAt(onnxModelConfig.getTrainedAt())
                .totalInferencesProcessed(onnxModelConfig.getTotalInferences())
                .averageInferenceLatencyMs(Math.round(onnxModelConfig.getAverageLatencyMs() * 100.0) / 100.0)
                .assistantModelLoaded(onnxModelConfig.isAssistantModelLoaded())
                .assistantModelPath(onnxModelConfig.getLoadedAssistantModelPath() != null ? onnxModelConfig.getLoadedAssistantModelPath() : "models/assistant_intent_model.onnx")
                .assistantVersion(onnxModelConfig.getAssistantVersion())
                .assistantModelSizeBytes(onnxModelConfig.getAssistantModelSizeBytes())
                .assistantVocabularySize(onnxModelConfig.getAssistantVocabularySize())
                .assistantIntents(onnxModelConfig.getAssistantClasses())
                .assistantAccuracyScore(onnxModelConfig.getAssistantAccuracyScore())
                .assistantTrainedAt(onnxModelConfig.getAssistantTrainedAt())
                .assistantTotalInferences(onnxModelConfig.getAssistantTotalInferences())
                .assistantAverageLatencyMs(Math.round(onnxModelConfig.getAssistantAverageLatencyMs() * 100.0) / 100.0)
                .build();
    }

    @Override
    public boolean reloadModel() {
        return onnxModelConfig.reload();
    }
}
