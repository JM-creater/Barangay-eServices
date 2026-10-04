package com.barangay.eservices.modules.notifications.service;

import com.barangay.eservices.config.MailProperties;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Properties;

@Component
public class SmtpEmailSender {

    private static final Logger logger = LoggerFactory.getLogger(SmtpEmailSender.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private MailProperties properties;

    private synchronized JavaMailSender getMailSender() {
        if (this.mailSender != null) {
            return this.mailSender;
        }

        JavaMailSenderImpl impl = new JavaMailSenderImpl();
        impl.setHost(properties.getSmtpHost());
        impl.setPort(properties.getSmtpPort());
        impl.setUsername(properties.getSmtpUser());
        impl.setPassword(properties.getSmtpKey());

        Properties props = impl.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", String.valueOf(properties.isSmtpAuth()));
        props.put("mail.smtp.starttls.enable", String.valueOf(properties.isSmtpStarttlsEnable()));
        props.put("mail.smtp.starttls.required", String.valueOf(properties.isSmtpStarttlsRequired()));
        props.put("mail.smtp.connectiontimeout", String.valueOf(properties.getSmtpConnectionTimeoutMs()));
        props.put("mail.smtp.timeout", String.valueOf(properties.getSmtpTimeoutMs()));
        props.put("mail.smtp.writetimeout", String.valueOf(properties.getSmtpWriteTimeoutMs()));

        this.mailSender = impl;
        return this.mailSender;
    }

    public boolean send(String toEmail, String recipientName, String subject, String htmlContent, String textContent) {
        JavaMailSender sender = getMailSender();
        if (sender == null) {
            logger.warn("[BREVO SMTP] JavaMailSender is not initialized. Check spring.mail properties.");
            return false;
        }

        try {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

            helper.setFrom(properties.getFromEmail(), properties.getFromName());
            if (properties.getReplyTo() != null && !properties.getReplyTo().isBlank()) {
                helper.setReplyTo(properties.getReplyTo(), properties.getFromName());
            }
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(textContent != null && !textContent.isBlank() ? textContent : htmlContent, htmlContent);

            sender.send(message);
            logger.info("[BREVO SMTP SUCCESS] Delivered email to <{}> via Brevo SMTP Relay", toEmail);
            return true;
        } catch (Exception ex) {
            logger.error("[BREVO SMTP ERROR] Failed sending to <{}>: {}", toEmail, ex.getMessage());
            return false;
        }
    }
}
