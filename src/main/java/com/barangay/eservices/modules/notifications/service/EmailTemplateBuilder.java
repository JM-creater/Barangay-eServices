package com.barangay.eservices.modules.notifications.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Year;

@Component
public class EmailTemplateBuilder {

    @Value("${app.frontend.url}")
    private String clientUrl;

    private String getBaseUrl() {
        return (clientUrl != null && !clientUrl.isBlank())
                ? clientUrl.trim().replaceAll("/+$", "")
                : "http://localhost:5173";
    }

    public String buildWelcomeTemplate(String fullName, String username) {
        String loginUrl = getBaseUrl() + "/login";
        String displayName = (fullName != null && !fullName.isBlank()) ? fullName : username;
        String content = """
            <h2 style="color: #0F2A4A; font-size: 20px; margin-top: 0;">Welcome to Barangay Cansojong e-Services!</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                Mabuhay, <strong>%s</strong>! Your resident portal account has been successfully created.
            </p>
            <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748B;">Registered Username:</p>
                <p style="margin: 0; font-size: 16px; font-weight: bold; color: #1E4E8C;">%s</p>
            </div>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                You can now log in to request barangay clearances, certificates of indigency, schedule appointment slots, and track the status of your applications online.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="%s" style="background-color: #1E4E8C; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Access Resident Portal
                </a>
            </div>
            """.formatted(escape(displayName), escape(username), loginUrl);

        return wrapMasterLayout("Welcome to Barangay Cansojong", content);
    }

    public String buildPasswordResetTemplate(String username, String token) {
        String resetUrl = getBaseUrl() + "/reset-password?token=" + token;
        String content = """
            <h2 style="color: #0F2A4A; font-size: 20px; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                Hello <strong>%s</strong>, a request was received to reset the password for your Barangay e-Services account.
            </p>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                Click the button below to reset your password. This link is valid for <strong>2 hours</strong>:
            </p>
            <div style="text-align: center; margin: 28px 0;">
                <a href="%s" style="background-color: #2E8B57; color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Reset My Password
                </a>
            </div>
            <p style="color: #64748B; font-size: 12px; margin-top: 24px; line-height: 1.5; word-break: break-all;">
                If the button above does not work, copy and paste this secure link into your browser:<br/>
                <a href="%s" style="color: #1E4E8C; text-decoration: underline;">%s</a>
            </p>
            <p style="color: #94A3B8; font-size: 13px; line-height: 1.5; margin-top: 16px;">
                If you did not request a password reset, please ignore this email or contact barangay administrators immediately.
            </p>
            """.formatted(escape(username), resetUrl, resetUrl, resetUrl);

        return wrapMasterLayout("Password Reset Request", content);
    }

    public String buildDocumentStatusTemplate(String title, String message, String referenceNumber, String actionUrl, String buttonText) {
        String effectiveActionUrl = (actionUrl != null && !actionUrl.isBlank()) ? actionUrl : (getBaseUrl() + "/track");
        String effectiveButtonText = (buttonText != null && !buttonText.isBlank()) ? buttonText : "Track Application";
        String buttonHtml = """
            <div style="text-align: center; margin: 28px 0;">
                <a href="%s" style="background-color: #1E4E8C; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; display: inline-block;">
                    %s
                </a>
            </div>
            """.formatted(effectiveActionUrl, effectiveButtonText);

        String refBadge = (referenceNumber != null && !referenceNumber.isBlank()) ? """
            <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 12px; margin: 16px 0;">
                <span style="font-size: 13px; color: #1E40AF; font-weight: bold;">Reference Number:</span>
                <span style="font-size: 15px; color: #1E3A8A; font-family: monospace; font-weight: bold; margin-left: 8px;">%s</span>
            </div>
            """.formatted(referenceNumber) : "";

        String content = """
            <h2 style="color: #0F2A4A; font-size: 20px; margin-top: 0;">%s</h2>
            %s
            <div style="color: #334155; font-size: 15px; line-height: 1.6; margin: 16px 0;">
                %s
            </div>
            %s
            """.formatted(escape(title), refBadge, escape(message).replace("\n", "<br/>"), buttonHtml);

        return wrapMasterLayout(title, content);
    }

    public String buildGeneralNotificationTemplate(String subject, String message) {
        String content = """
            <h2 style="color: #0F2A4A; font-size: 18px; margin-top: 0;">%s</h2>
            <div style="color: #334155; font-size: 15px; line-height: 1.6;">
                %s
            </div>
            <div style="text-align: center; margin: 24px 0;">
                <a href="%s" style="background-color: #1E4E8C; color: #FFFFFF; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
                    View in Resident Portal
                </a>
            </div>
            """.formatted(escape(subject), escape(message).replace("\n", "<br/>"), getBaseUrl());

        return wrapMasterLayout(subject, content);
    }


    private String wrapMasterLayout(String preheader, String bodyContent) {
        int currentYear = Year.now().getValue();
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>%s</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%%" style="table-layout: fixed; background-color: #F1F5F9;">
                    <tr>
                        <td align="center" style="padding: 24px 12px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                                <!-- Header -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #1E4E8C 0%%, #0F2A4A 100%%); padding: 28px 24px; text-align: center;">
                                        <h1 style="margin: 0; color: #FFFFFF; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">
                                            BARANGAY CANSOJONG
                                        </h1>
                                        <p style="margin: 4px 0 0 0; color: #93C5FD; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
                                            City of Talisay, Province of Cebu &bull; e-Services Portal
                                        </p>
                                    </td>
                                </tr>
                                <!-- Main Content -->
                                <tr>
                                    <td style="padding: 32px 28px;">
                                        %s
                                    </td>
                                </tr>
                                <!-- Footer -->
                                <tr>
                                    <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px 24px; text-align: center;">
                                        <p style="margin: 0; color: #64748B; font-size: 12px; line-height: 1.5;">
                                            This is an automated administrative notification from the official Barangay Cansojong e-Services System.<br/>
                                            Barangay Hall, Cansojong, Talisay City, Cebu 6045
                                        </p>
                                        <p style="margin: 8px 0 0 0; color: #94A3B8; font-size: 11px;">
                                            &copy; %d Barangay Cansojong. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """.formatted(escape(preheader), bodyContent, currentYear);
    }

    private String escape(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
