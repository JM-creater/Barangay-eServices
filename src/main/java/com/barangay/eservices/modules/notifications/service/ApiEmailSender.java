package com.barangay.eservices.modules.notifications.service;

import com.barangay.eservices.config.MailProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class ApiEmailSender {

    private static final Logger logger = LoggerFactory.getLogger(ApiEmailSender.class);
    private final MailProperties properties;
    private final RestTemplate restTemplate;

    public ApiEmailSender(MailProperties properties, RestTemplateBuilder builder) {
        this.properties = properties;
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofMillis(properties.getApi().getConnectTimeoutMs()))
                .setReadTimeout(Duration.ofMillis(properties.getApi().getReadTimeoutMs()))
                .build();
    }

    public boolean send(String toEmail, String recipientName, String subject, String htmlContent, String textContent) {
        String apiKey = properties.getApi().getApiKey();
        if (apiKey == null || apiKey.trim().isEmpty()) {
            logger.warn("[BREVO API] API key is missing. Skipping email to <{}>", toEmail);
            return false;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey.trim());
            headers.set("accept", "application/json");

            Map<String, Object> payload = new HashMap<>();

            Map<String, Object> senderMap = new HashMap<>();
            senderMap.put("name", properties.getFromName() != null ? properties.getFromName() : "Barangay Cansojong e-Services");
            senderMap.put("email", properties.getFromEmail() != null ? properties.getFromEmail() : "noreply@barangay-eservices.work.gd");
            payload.put("sender", senderMap);

            List<Map<String, String>> toList = new ArrayList<>();
            Map<String, String> toMap = new HashMap<>();
            toMap.put("email", toEmail);
            toMap.put("name", (recipientName != null && !recipientName.isBlank()) ? recipientName : toEmail);
            toList.add(toMap);
            payload.put("to", toList);

            if (properties.getReplyTo() != null && !properties.getReplyTo().isBlank()) {
                Map<String, String> replyToMap = new HashMap<>();
                replyToMap.put("email", properties.getReplyTo());
                replyToMap.put("name", properties.getFromName() != null ? properties.getFromName() : "Barangay Cansojong e-Services");
                payload.put("replyTo", replyToMap);
            }

            payload.put("subject", subject);
            payload.put("htmlContent", htmlContent);
            if (textContent != null && !textContent.isBlank()) {
                payload.put("textContent", textContent);
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    properties.getApi().getApiUrl(), entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                Object messageId = response.getBody() != null ? response.getBody().get("messageId") : "N/A";
                logger.info("[BREVO API SUCCESS] Sent to <{}> | Subject: '{}' | MessageId: {}", toEmail, subject, messageId);
                return true;
            } else {
                logger.error("[BREVO API FAILED] Status: {} | Body: {}", response.getStatusCode(), response.getBody());
                return false;
            }
        } catch (HttpStatusCodeException ex) {
            logger.error("[BREVO API ERROR] HTTP {} response: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            return false;
        } catch (Exception ex) {
            logger.error("[BREVO API EXCEPTION] Failed to send email to <{}>: {}", toEmail, ex.getMessage());
            return false;
        }
    }
}
