package com.barangay.eservices.modules.ai.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
    @Size(max = 1000, message = "User message cannot exceed 1000 characters")
    private String message;

    @Size(max = 50, message = "Conversation history cannot exceed 50 messages")
    @Valid
    private List<@Valid ChatMessageDTO> conversationHistory;

    @Size(max = 100, message = "Context cannot exceed 100 characters")
    private String context; // e.g. "APPLY_SERVICE_CLEARANCE", "TRACKING", "RESIDENT_DASHBOARD"
}
