package com.barangay.eservices.modules.ai.service;

import com.barangay.eservices.modules.ai.config.OnnxModelConfig;
import com.barangay.eservices.modules.ai.dto.AiVisionVerificationResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.util.*;

@Service
public class AiVisionServiceImpl implements AiVisionService {

    private static final Logger logger = LoggerFactory.getLogger(AiVisionServiceImpl.class);

    private final OnnxModelConfig onnxModelConfig;

    private static final Map<String, String> CLASS_LABELS = new LinkedHashMap<>();
    static {
        CLASS_LABELS.put("philsys_national_id", "Philippine National ID / ePhilID");
        CLASS_LABELS.put("drivers_license", "LTO Driver's License");
        CLASS_LABELS.put("umid_card", "UMID Card (SSS / GSIS)");
        CLASS_LABELS.put("passport_id", "Philippine Passport (DFA)");
        CLASS_LABELS.put("postal_id", "PhilPost Postal ID");
        CLASS_LABELS.put("voters_certificate", "COMELEC Voter's Certificate / ID");
        CLASS_LABELS.put("senior_citizen_id", "OSCA Senior Citizen ID");
        CLASS_LABELS.put("pwd_id", "Persons with Disability (PWD) ID");
        CLASS_LABELS.put("barangay_resident_id", "Barangay Cansojong Resident ID");
        CLASS_LABELS.put("two_by_two_photo", "Formal 2x2 ID Portrait Photo");
        CLASS_LABELS.put("invalid_non_id", "Non-ID Negative Sample (Receipt, Card, Food, Selfie)");
    }

    public AiVisionServiceImpl(OnnxModelConfig onnxModelConfig) {
        this.onnxModelConfig = onnxModelConfig;
    }

    @Override
    public boolean isModelLoaded() {
        return onnxModelConfig.isVisionModelLoaded();
    }

    @Override
    public AiVisionVerificationResponse verifyDocumentImage(MultipartFile file) {
        long start = System.nanoTime();
        if (file == null || file.isEmpty()) {
            return AiVisionVerificationResponse.builder()
                    .detectedClass("invalid_non_id")
                    .classDescription("Empty or Invalid File")
                    .confidence(0.0)
                    .validDocument(false)
                    .twoByTwo(false)
                    .aspectRatio(0.0)
                    .blurScore(0.0)
                    .sharp(false)
                    .qualityAssessment("NO_FILE_UPLOADED")
                    .userMessage("Please upload a valid document or ID image.")
                    .latencyMs(0.0)
                    .classProbabilities(Collections.emptyMap())
                    .build();
        }

        try {
            BufferedImage img = ImageIO.read(file.getInputStream());
            if (img == null) {
                return AiVisionVerificationResponse.builder()
                        .detectedClass("invalid_non_id")
                        .classDescription("Unreadable Image File")
                        .confidence(0.0)
                        .validDocument(false)
                        .twoByTwo(false)
                        .aspectRatio(0.0)
                        .blurScore(0.0)
                        .sharp(false)
                        .qualityAssessment("IMAGE_DECODE_FAILED")
                        .userMessage("Unable to decode the image format. Please upload a JPG, PNG, or WebP file.")
                        .latencyMs(0.0)
                        .classProbabilities(Collections.emptyMap())
                        .build();
            }

            return verifyDocumentImage(img);
        } catch (Exception ex) {
            logger.error("Error processing document image: {}", ex.getMessage(), ex);
            return AiVisionVerificationResponse.builder()
                    .detectedClass("invalid_non_id")
                    .classDescription("Processing Error")
                    .confidence(0.0)
                    .validDocument(false)
                    .twoByTwo(false)
                    .aspectRatio(0.0)
                    .blurScore(0.0)
                    .sharp(false)
                    .qualityAssessment("ERROR")
                    .userMessage("An error occurred while processing the image: " + ex.getMessage())
                    .latencyMs((System.nanoTime() - start) / 1_000_000.0)
                    .classProbabilities(Collections.emptyMap())
                    .build();
        }
    }

    @Override
    public AiVisionVerificationResponse verifyDocumentImage(BufferedImage img) {
        long start = System.nanoTime();

        int w = img.getWidth();
        int h = img.getHeight();
        double aspectRatio = (double) w / Math.max(h, 1);

        // 1. Extract 3080-dimensional feature vector
        float[] features = extractImageFeatures(img);

        // 2. Run inference (ONNX session or pure JVM neural fallback)
        float[] probs = onnxModelConfig.runVisionInference(features);
        List<String> classes = onnxModelConfig.getVisionClasses();
        if (classes == null || classes.isEmpty()) {
            classes = new ArrayList<>(CLASS_LABELS.keySet());
        }

        if (probs == null || probs.length == 0) {
            probs = new float[classes.size()];
            Arrays.fill(probs, 1.0f / classes.size());
        }

        // 3. Find top class, runner-up class, and construct probabilities map
        int bestIdx = 0;
        float bestProb = -1.0f;
        float secondProb = -1.0f;
        Map<String, Double> probMap = new LinkedHashMap<>();

        for (int i = 0; i < classes.size(); i++) {
            float p = i < probs.length ? probs[i] : 0.0f;
            probMap.put(classes.get(i), Math.round(p * 10000.0) / 100.0);
            if (p > bestProb) {
                secondProb = bestProb;
                bestProb = p;
                bestIdx = i;
            } else if (p > secondProb) {
                secondProb = p;
            }
        }

        String detected = classes.get(bestIdx);

        // =====================================================================
        // LOW-CONFIDENCE & DOCUMENT SANITY GUARD
        // Prevents out-of-distribution photos, casual selfies, and ambiguous
        // uploads from falsely passing as verified government credentials.
        // =====================================================================
        boolean sanityFailed = false;

        if (!"invalid_non_id".equals(detected)) {
            // Guard 1: High Confidence Threshold (Minimum 80% confidence required for government IDs)
            if (bestProb < 0.80f) {
                sanityFailed = true;
            } else if (secondProb > 0 && (bestProb - secondProb) < 0.20f) {
                // Runner-up class is too close (low margin / ambiguous prediction)
                sanityFailed = true;
            }

            // Guard 2: Aspect Ratio & Physical Geometry Guard
            if (!sanityFailed) {
                if ("two_by_two_photo".equals(detected)) {
                    // Formal 2x2 portrait photo must be approximately square (0.80 to 1.25)
                    if (aspectRatio < 0.80 || aspectRatio > 1.25) {
                        sanityFailed = true;
                    }
                } else if ("voters_certificate".equals(detected)) {
                    // Voter's certificate document sheet
                    if (aspectRatio < 0.60 || aspectRatio > 1.70) {
                        sanityFailed = true;
                    }
                } else if ("passport_id".equals(detected)) {
                    // Philippine Passport: Single data page (~1.30 to 1.65) or open booklet spread (~0.60 to 0.85)
                    boolean isValidPassportRatio = (aspectRatio >= 0.55 && aspectRatio <= 0.88) || 
                                                  (aspectRatio >= 1.15 && aspectRatio <= 1.85);
                    if (!isValidPassportRatio) {
                        sanityFailed = true;
                    }
                } else {
                    // Standard ID Card (PhilSys, Driver's License, UMID, Postal, Senior Citizen, PWD, Barangay ID)
                    // Standard ISO ID-1 card geometry is ~1.58. Acceptable capture range is 1.15 to 2.25.
                    if (aspectRatio < 1.15 || aspectRatio > 2.25) {
                        sanityFailed = true;
                    }
                }
            }

            // Guard 3: Severe Blur Guard
            double blurScoreVal = features[7] * 100.0;
            if (!sanityFailed && blurScoreVal < 50.0 && bestProb < 0.90f) {
                sanityFailed = true;
            }
        }

        // Apply Sanity Override
        if (sanityFailed) {
            logger.info("Document Sanity Guard triggered on class '{}' (confidence: {}%, aspect ratio: {}). Overriding to invalid_non_id.",
                    detected, Math.round(bestProb * 100.0f), Math.round(aspectRatio * 100.0) / 100.0);
            detected = "invalid_non_id";
        }

        String description = CLASS_LABELS.getOrDefault(detected, detected);
        boolean isValidDoc = !"invalid_non_id".equals(detected);
        boolean isTwoByTwo = "two_by_two_photo".equals(detected);

        // Quality assessments
        double blurScore = features[7] * 100.0;
        boolean isSharp = blurScore >= 90.0;

        String qualityAssessment = isSharp ? "CRISP_AND_LEGIBLE" : "SLIGHTLY_BLURRY";
        String userMessage = buildUserMessage(detected, description, bestProb, isSharp, aspectRatio, sanityFailed);

        long end = System.nanoTime();
        double latencyMs = (end - start) / 1_000_000.0;
        onnxModelConfig.recordVisionInference((long) latencyMs);

        return AiVisionVerificationResponse.builder()
                .detectedClass(detected)
                .classDescription(description)
                .confidence(Math.round(bestProb * 10000.0) / 10000.0)
                .validDocument(isValidDoc)
                .twoByTwo(isTwoByTwo)
                .aspectRatio(Math.round(aspectRatio * 100.0) / 100.0)
                .blurScore(Math.round(blurScore * 10.0) / 10.0)
                .sharp(isSharp)
                .qualityAssessment(qualityAssessment)
                .userMessage(userMessage)
                .latencyMs(Math.round(latencyMs * 100.0) / 100.0)
                .classProbabilities(probMap)
                .build();
    }

    private String buildUserMessage(String detected, String desc, float confidence, boolean isSharp, double aspectRatio, boolean sanityFailed) {
        if ("invalid_non_id".equals(detected)) {
            if (sanityFailed) {
                return "Unrecognized document. The image could not be verified with high confidence (" 
                        + Math.round(confidence * 100.0f) + "% match). Please ensure you upload an official Philippine government ID (e.g., PhilSys, Passport, Driver's License, UMID, Postal ID, Voter's Certificate, Senior Citizen ID, PWD ID, Barangay ID) or a formal 2x2 photo.";
            }
            return "Unrecognized document. Please ensure you upload an official Philippine government ID (e.g., PhilSys, Passport, Driver's License, UMID, Postal ID, Voter's Certificate, Senior Citizen ID, PWD ID, Barangay ID) or a formal 2x2 photo.";
        }
        if ("two_by_two_photo".equals(detected)) {
            if (aspectRatio < 0.85 || aspectRatio > 1.25) {
                return "2x2 Portrait photo detected, but aspect ratio is not a standard square (1:1). It can still be used if the applicant's face is clearly visible.";
            }
            return "Valid 2x2 Formal ID Picture. The photo is sharp, properly framed, and suitable for certificate processing.";
        }

        int pct = Math.round(confidence * 100.0f);
        if (pct >= 85) {
            return "Identified as " + desc + " (" + pct + "% confidence). Valid and ready for processing at Barangay Cansojong.";
        } else {
            return "Likely " + desc + " (" + pct + "% confidence). Please ensure all details and text are clear and legible.";
        }
    }

    private float[] extractImageFeatures(BufferedImage img) {
        int w = img.getWidth();
        int h = img.getHeight();
        float aspectRatio = (float) w / (float) Math.max(h, 1);
        float normAspect = Math.min(aspectRatio / 3.0f, 2.0f);

        // Resize to 32x32
        BufferedImage resized = new BufferedImage(32, 32, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = resized.createGraphics();
        g2d.drawImage(img, 0, 0, 32, 32, null);
        g2d.dispose();

        float[] gridFlat = new float[32 * 32 * 3];
        float sumR = 0, sumG = 0, sumB = 0;
        float[][] gray = new float[32][32];

        int idx = 0;
        for (int y = 0; y < 32; y++) {
            for (int x = 0; x < 32; x++) {
                int rgb = resized.getRGB(x, y);
                float r = ((rgb >> 16) & 0xFF) / 255.0f;
                float g = ((rgb >> 8) & 0xFF) / 255.0f;
                float b = (rgb & 0xFF) / 255.0f;

                gridFlat[idx++] = r;
                gridFlat[idx++] = g;
                gridFlat[idx++] = b;

                sumR += r;
                sumG += g;
                sumB += b;

                gray[y][x] = 0.299f * r + 0.587f * g + 0.114f * b;
            }
        }

        int totalPixels = 32 * 32;
        float meanR = sumR / totalPixels;
        float meanG = sumG / totalPixels;
        float meanB = sumB / totalPixels;

        float varR = 0, varG = 0, varB = 0;
        for (int i = 0; i < gridFlat.length; i += 3) {
            varR += (gridFlat[i] - meanR) * (gridFlat[i] - meanR);
            varG += (gridFlat[i + 1] - meanG) * (gridFlat[i + 1] - meanG);
            varB += (gridFlat[i + 2] - meanB) * (gridFlat[i + 2] - meanB);
        }
        float stdR = (float) Math.sqrt(varR / totalPixels);
        float stdG = (float) Math.sqrt(varG / totalPixels);
        float stdB = (float) Math.sqrt(varB / totalPixels);

        // Discrete Laplacian blur proxy
        float lapSum = 0, lapSumSq = 0;
        int lapCount = 0;
        for (int y = 1; y < 31; y++) {
            for (int x = 1; x < 31; x++) {
                float lap = gray[y - 1][x] + gray[y + 1][x] + gray[y][x - 1] + gray[y][x + 1] - 4.0f * gray[y][x];
                lapSum += lap;
                lapSumSq += lap * lap;
                lapCount++;
            }
        }
        float lapMean = lapSum / Math.max(lapCount, 1);
        float lapVar = (lapSumSq / Math.max(lapCount, 1)) - (lapMean * lapMean);
        float blurScore = Math.min((lapVar * 255.0f * 255.0f) / 100.0f, 10.0f);

        float[] features = new float[3080];
        features[0] = normAspect;
        features[1] = meanR;
        features[2] = meanG;
        features[3] = meanB;
        features[4] = stdR;
        features[5] = stdG;
        features[6] = stdB;
        features[7] = blurScore;
        System.arraycopy(gridFlat, 0, features, 8, gridFlat.length);

        return features;
    }

    @Override
    public Map<String, Object> getVisionModelDiagnostics() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("modelLoaded", onnxModelConfig.isVisionModelLoaded());
        map.put("modelPath", onnxModelConfig.getLoadedVisionModelPath());
        map.put("modelSize", onnxModelConfig.getVisionModelSizeBytes());
        map.put("version", onnxModelConfig.getVisionVersion());
        map.put("accuracy", onnxModelConfig.getVisionAccuracyScore());
        map.put("trainedAt", onnxModelConfig.getVisionTrainedAt());
        map.put("totalInferences", onnxModelConfig.getVisionTotalInferences());
        map.put("averageLatencyMs", onnxModelConfig.getVisionAverageLatencyMs());
        map.put("classes", onnxModelConfig.getVisionClasses());
        return map;
    }
}
