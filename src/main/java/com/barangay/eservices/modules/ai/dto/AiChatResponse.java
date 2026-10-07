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
public class AiChatResponse {

    private String reply;

    private List<String> suggestedPrompts;

    private List<String> relatedServices;

    private String engine; // "BARANGAY_INTELLIGENT_KNOWLEDGE_ENGINE"

    private String detectedIntent;

    private Double confidenceScore;

    private String actionLink;

    private String contextBadge;
}
