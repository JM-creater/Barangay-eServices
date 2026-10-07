package com.barangay.eservices.modules.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiGenerateRemarksResponse {

    private String generatedRemarks;
    private String subject;
    private String suggestedAction;
}
