package com.barangay.eservices.modules.notifications.service;

import com.barangay.eservices.config.MailProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired
    private MailProperties properties;

    @Autowired
    private ApiEmailSender apiSender;

    @Autowired
    private SmtpEmailSender smtpSender;

    @Autowired
    private EmailTemplateBuilder templateBuilder;

    @Override
    @Async("mailTaskExecutor")
    public void sendEmail(String toEmail, String subject, String messageContent) {
        if (!shouldSend(toEmail)) return;

        String html = templateBuilder.buildGeneralNotificationTemplate(subject, messageContent);
        dispatch(toEmail, null, subject, html, messageContent);
    }

    @Override
    @Async("mailTaskExecutor")
    public void sendHtmlEmail(String toEmail, String recipientName, String subject, String htmlBody) {
        if (!shouldSend(toEmail)) return;

        dispatch(toEmail, recipientName, subject, htmlBody, null);
    }

    private boolean dispatch(String toEmail, String recipientName, String subject, String htmlContent, String textContent) {
        try {
            if ("brevo-smtp".equalsIgnoreCase(properties.getProvider())) {
                return smtpSender.send(toEmail, recipientName, subject, htmlContent, textContent);
            } else {
                return apiSender.send(toEmail, recipientName, subject, htmlContent, textContent);
            }
        } catch (Throwable t) {
            logger.error("[EMAIL CRITICAL FAILURE] Uncaught exception during email dispatch to <{}>: {}", toEmail, t.getMessage());
            return false;
        }
    }

    private boolean shouldSend(String toEmail) {
        if (!properties.isEnabled()) {
            logger.debug("[EMAIL DISABLED] Outbound emails are disabled. Target was <{}>", toEmail);
            return false;
        }
        return toEmail != null && !toEmail.trim().isEmpty() && toEmail.contains("@");
    }
}
