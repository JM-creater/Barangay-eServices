package com.barangay.eservices.modules.ai.controller;

import com.barangay.eservices.modules.ai.dto.*;
import com.barangay.eservices.modules.ai.service.AiGenerativeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "Generative AI Assistant", description = "Barangay AI Citizen Chatbot and administrative official remarks generation")
public class AiGenerativeController {

    private final AiGenerativeService aiGenerativeService;

    public AiGenerativeController(AiGenerativeService aiGenerativeService) {
        this.aiGenerativeService = aiGenerativeService;
    }

    @PostMapping("/assistant/chat")
    @Operation(summary = "Chat with the Barangay Cansojong e-Services AI Assistant for citizen inquiries and guidance")
    public ResponseEntity<AiChatResponse> chat(@Valid @RequestBody AiChatRequest request) {
        AiChatResponse response = aiGenerativeService.chat(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/assistant/quick-prompts")
    @Operation(summary = "Get suggested citizen inquiry prompts for the AI assistant widget")
    public ResponseEntity<List<String>> getQuickPrompts() {
        return ResponseEntity.ok(aiGenerativeService.getQuickPrompts());
    }

    @GetMapping("/assistant/contextual-prompts")
    @Operation(summary = "Get context-aware suggested prompts tailored to current page, service, or application")
    public ResponseEntity<AiContextualPromptsResponse> getContextualPrompts(
            @RequestParam(required = false) String page,
            @RequestParam(required = false) String serviceCode,
            @RequestParam(required = false) String referenceNumber) {
        AiContextualPromptsResponse response = aiGenerativeService.getContextualPrompts(page, serviceCode, referenceNumber);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/assistant/model-reload")
    @PreAuthorize("hasAnyRole('STAFF', 'APPROVER', 'ADMIN')")
    @Operation(summary = "Hot-reload the citizen assistant NLP model from disk into JVM memory")
    public ResponseEntity<Map<String, Object>> reloadAssistantModel() {
        boolean success = aiGenerativeService.reloadAssistantModel();
        return ResponseEntity.ok(Map.of(
                "reloaded", success,
                "message", success ? "Citizen Assistant NLP Model successfully reloaded into native JVM memory." : "Failed to reload assistant model from disk. Ensure 'train.bat' was run."
        ));
    }

    @PostMapping("/generate-remarks")
    @PreAuthorize("hasAnyRole('STAFF', 'APPROVER', 'ADMIN')")
    @Operation(summary = "Generate formal administrative remarks, correction notices, or official endorsements")
    public ResponseEntity<AiGenerateRemarksResponse> generateRemarks(@Valid @RequestBody AiGenerateRemarksRequest request) {
        AiGenerateRemarksResponse response = aiGenerativeService.generateRemarks(request);
        return ResponseEntity.ok(response);
    }
}
