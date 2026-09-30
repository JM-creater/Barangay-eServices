package com.barangay.eservices.modules.notifications.service;

public interface EmailService {

    void sendEmail(String toEmail, String subject, String messageContent);
}
