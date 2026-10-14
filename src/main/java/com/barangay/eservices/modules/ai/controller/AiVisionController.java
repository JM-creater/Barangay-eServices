package com.barangay.eservices.modules.ai.controller;

import com.barangay.eservices.modules.ai.dto.AiVisionVerificationResponse;
import com.barangay.eservices.modules.ai.service.AiVisionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ai/vision")
@Tag(name = "AI Vision Controller", description = "In-House Computer Vision Philippine ID & Document Verification API")
public class AiVisionController {

    private final AiVisionService aiVisionService;

    public AiVisionController(AiVisionService aiVisionService) {
        this.aiVisionService = aiVisionService;
    }

    @PostMapping(value = "/verify", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Verify Document or Philippine ID", description = "Classifies uploaded document image and performs in-memory blur, aspect-ratio, and authenticity evaluation")
    public ResponseEntity<AiVisionVerificationResponse> verifyDocument(@RequestParam("file") MultipartFile file) {
        AiVisionVerificationResponse response = aiVisionService.verifyDocumentImage(file);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    @Operation(summary = "Get Vision Model Status", description = "Retrieves in-memory ONNX vision runtime metrics and class taxonomy")
    public ResponseEntity<Map<String, Object>> getVisionStatus() {
        return ResponseEntity.ok(aiVisionService.getVisionModelDiagnostics());
    }
}
