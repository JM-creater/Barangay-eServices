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
public class AiContextualPromptsResponse {
    private String contextBadge;
    private String primaryPrompt;
    private List<String> suggestedPrompts;
    private String actionLink;
}
