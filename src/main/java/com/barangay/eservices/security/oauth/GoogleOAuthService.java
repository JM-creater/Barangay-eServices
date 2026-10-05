package com.barangay.eservices.security.oauth;

import com.barangay.eservices.config.GoogleOAuthProperties;
import com.barangay.eservices.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

/**
 * Service for securely verifying Google OAuth ID Tokens and extracting identity claims.
 */
@Service
public class GoogleOAuthService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleOAuthService.class);

    private final GoogleOAuthProperties properties;
    private final RestTemplate restTemplate;

    public GoogleOAuthService(GoogleOAuthProperties properties, RestTemplateBuilder restTemplateBuilder) {
        this.properties = properties;
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(10))
                .build();
    }

    /**
     * Verifies a Google ID token against Google's authoritative OAuth2 tokeninfo endpoint.
     * Validates cryptographic authenticity, issuer, audience, email verification, and expiration.
     *
     * @param idToken the Google ID token string
     * @return verified GoogleUserInfo object
     * @throws BadRequestException if verification fails or token is forged/expired/invalid
     */
    public GoogleUserInfo verifyToken(String idToken) {
        if (idToken == null || idToken.trim().isEmpty()) {
            throw new BadRequestException("Google ID token is required");
        }

        try {
            String url = properties.getTokenInfoUrl() + "?id_token=" + URLEncoder.encode(idToken.trim(), StandardCharsets.UTF_8);
            ResponseEntity<Map> response = restTemplate.getForEntity(URI.create(url), Map.class);

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                throw new BadRequestException("Google authentication verification failed with status: " + response.getStatusCode());
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();

            // 1. Validate Issuer
            String iss = (String) body.get("iss");
            if (!"https://accounts.google.com".equals(iss) && !"accounts.google.com".equals(iss)) {
                logger.warn("Invalid issuer in Google token: {}", iss);
                throw new BadRequestException("Untrusted token issuer: " + iss);
            }

            // 2. Validate Email Verification
            Object emailVerifiedObj = body.get("email_verified");
            boolean emailVerified = "true".equalsIgnoreCase(String.valueOf(emailVerifiedObj)) || Boolean.TRUE.equals(emailVerifiedObj);
            if (!emailVerified) {
                throw new BadRequestException("The email associated with this Google account has not been verified by Google");
            }

            // 3. Validate Audience / Client ID if configured in backend
            String configuredClientId = properties.getClientId();
            if (configuredClientId != null && !configuredClientId.trim().isEmpty()) {
                String aud = (String) body.get("aud");
                String azp = (String) body.get("azp");
                if (!configuredClientId.equals(aud) && !configuredClientId.equals(azp)) {
                    logger.warn("Google token audience mismatch. Expected: {}, Got aud: {}, azp: {}", configuredClientId, aud, azp);
                    throw new BadRequestException("Google token audience mismatch - unauthorized client ID");
                }
            }

            // 4. Validate Expiry
            Object expObj = body.get("exp");
            if (expObj != null) {
                long exp = Long.parseLong(String.valueOf(expObj));
                long now = System.currentTimeMillis() / 1000L;
                if (now > exp) {
                    throw new BadRequestException("Google authentication token has expired");
                }
            }

            // 5. Extract User Identity Claims
            String sub = (String) body.get("sub");
            String email = (String) body.get("email");
            if (sub == null || sub.isBlank() || email == null || email.isBlank()) {
                throw new BadRequestException("Google token is missing required identity claims");
            }

            String name = (String) body.get("name");
            String givenName = (String) body.get("given_name");
            String familyName = (String) body.get("family_name");
            String picture = (String) body.get("picture");

            if ((givenName == null || givenName.isBlank()) && name != null && !name.isBlank()) {
                String[] parts = name.trim().split("\\s+", 2);
                givenName = parts[0];
                if (parts.length > 1) {
                    familyName = parts[1];
                }
            }

            if (givenName == null || givenName.isBlank()) {
                givenName = email.split("@")[0];
            }
            if (familyName == null || familyName.isBlank()) {
                familyName = "Resident";
            }

            return GoogleUserInfo.builder()
                    .sub(sub)
                    .email(email.toLowerCase().trim())
                    .name(name)
                    .givenName(givenName.trim())
                    .familyName(familyName.trim())
                    .pictureUrl(picture)
                    .build();

        } catch (HttpStatusCodeException ex) {
            logger.warn("Google tokeninfo returned error status: {} - {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new BadRequestException("Invalid or expired Google authentication credentials");
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            logger.error("Unexpected error validating Google ID token: {}", ex.getMessage(), ex);
            throw new BadRequestException("Failed to verify Google authentication: " + ex.getMessage());
        }
    }
}
