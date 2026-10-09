package com.barangay.eservices.modules.ai.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    @Size(max = 20, message = "Role cannot exceed 20 characters")
    private String role; // "user" or "assistant" or "system"

    @Size(max = 2000, message = "Message content cannot exceed 2000 characters")
    private String content;
}
