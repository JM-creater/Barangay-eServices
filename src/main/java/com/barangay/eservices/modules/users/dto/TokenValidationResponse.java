package com.barangay.eservices.modules.users.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Schema(description = "Response DTO for proactive password reset token validation")
public class TokenValidationResponse {

    @Schema(description = "Whether the token exists, is unexpired, and has not yet been used", example = "true")
    private boolean valid;

    @Schema(description = "Human-readable status message for UI presentation", example = "Password reset link is valid and ready.")
    private String message;

    public TokenValidationResponse() {
    }

    public TokenValidationResponse(boolean valid, String message) {
        this.valid = valid;
        this.message = message;
    }

    public static TokenValidationResponse valid() {
        return new TokenValidationResponse(true, "Password reset link is valid and active.");
    }

    public static TokenValidationResponse invalid(String message) {
        return new TokenValidationResponse(false, message);
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
