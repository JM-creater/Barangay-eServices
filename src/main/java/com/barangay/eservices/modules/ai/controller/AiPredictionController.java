package com.barangay.eservices.modules.ai.controller;

import com.barangay.eservices.modules.ai.dto.AiModelStatusResponse;
import com.barangay.eservices.modules.ai.dto.AiPredictionRequest;
import com.barangay.eservices.modules.ai.dto.AiPredictionResponse;
import com.barangay.eservices.modules.ai.service.AiPredictionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Prediction Engine", description = "Sub-millisecond native in-memory ONNX runtime execution for application turnaround prediction and risk assessment")
public class AiPredictionController {

    private final AiPredictionService aiPredictionService;

    public AiPredictionController(AiPredictionService aiPredictionService) {
        this.aiPredictionService = aiPredictionService;
    }

    @PostMapping("/predict")
    @Operation(summary = "Predict application turnaround time and readiness category in-memory via ONNX")
    public ResponseEntity<AiPredictionResponse> predictApplication(@Valid @RequestBody AiPredictionRequest request) {
        AiPredictionResponse response = aiPredictionService.predictApplication(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/model-status")
    @Operation(summary = "Get the status of the loaded ONNX model, metadata, and inference latency statistics")
    public ResponseEntity<AiModelStatusResponse> getModelStatus() {
        return ResponseEntity.ok(aiPredictionService.getModelStatus());
    }

    @PostMapping("/model-reload")
    @PreAuthorize("hasAnyRole('STAFF', 'APPROVER', 'ADMIN')")
    @Operation(summary = "Hot-reload the ONNX model from disk into JVM memory without restarting the application")
    public ResponseEntity<Map<String, Object>> reloadModel() {
        boolean success = aiPredictionService.reloadModel();
        return ResponseEntity.ok(Map.of(
                "reloaded", success,
                "message", success ? "ONNX Model successfully reloaded into native JVM memory." : "Failed to load model file from disk. Ensure 'python ai/train.py' was run.",
                "status", aiPredictionService.getModelStatus()
        ));
    }
}
