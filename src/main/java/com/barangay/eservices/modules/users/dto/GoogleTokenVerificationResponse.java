package com.barangay.eservices.modules.users.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleTokenVerificationResponse {
    private boolean registered;
    private String email;
    private String firstName;
    private String lastName;
    private String pictureUrl;
    private String suggestedUsername;
    private String message;
}
