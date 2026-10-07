package com.barangay.eservices.modules.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiChatRequest {

    @NotBlank(message = "User message cannot be empty")
    private String message;

    private List<ChatMessageDTO> conversationHistory;

    private String context; // e.g. "APPLY_SERVICE_CLEARANCE", "TRACKING", "RESIDENT_DASHBOARD"
}
