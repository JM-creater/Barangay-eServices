package com.barangay.eservices.modules.notifications.service;

public interface EmailService {

    void sendEmail(String toEmail, String subject, String messageContent);

    void sendHtmlEmail(String toEmail, String recipientName, String subject, String htmlBody);
}
