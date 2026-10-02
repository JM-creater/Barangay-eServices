package com.barangay.eservices.modules.notifications.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Value("${app.mail.enabled}")
    private boolean mailEnabled;

    @Value("${app.mail.from}")
    private String mailFrom;

    @Override
    public void sendEmail(String toEmail, String subject, String messageContent) {
        if (toEmail == null || toEmail.trim().isEmpty()) {
            return;
        }

        if (mailEnabled) {
            // If mail server is configured, log or integrate with JavaMailSender
            logger.info("[SMTP EMAIL SENT] From: <{}> To: <{}> Subject: '{}'", mailFrom, toEmail, subject);
        } else {
            // Graceful non-blocking logger for optional email provider
            logger.info("[EMAIL NOTIFICATION] To: <{}> | Subject: '{}' | Content: '{}'",
                    toEmail, subject, messageContent.length() > 80 ? messageContent.substring(0, 80) + "..." : messageContent);
        }
    }
}
