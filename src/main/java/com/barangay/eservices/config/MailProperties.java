package com.barangay.eservices.config;

import jakarta.annotation.PostConstruct;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Data
@Component
public class MailProperties {

    @Value("${app.mail.enabled}")
    private boolean enabled;

    @Value("${app.mail.provider}")
    private String provider;

    @Value("${app.mail.from-name}")
    private String fromName;

    @Value("${app.mail.from-email}")
    private String fromEmail;

    @Value("${app.mail.reply-to}")
    private String replyTo;

    @Value("${app.mail.brevo.api-key}")
    private String apiKey;

    @Value("${app.mail.brevo.api-url}")
    private String apiUrl;

    @Value("${app.mail.brevo.connect-timeout-ms}")
    private int connectTimeoutMs;

    @Value("${app.mail.brevo.read-timeout-ms}")
    private int readTimeoutMs;

    @Value("${spring.mail.host}")
    private String smtpHost;

    @Value("${spring.mail.port}")
    private int smtpPort;

    @Value("${spring.mail.username}")
    private String smtpUser;

    @Value("${spring.mail.password}")
    private String smtpKey;

    @Value("${spring.mail.properties.mail.smtp.auth}")
    private boolean smtpAuth;

    @Value("${spring.mail.properties.mail.smtp.starttls.enable}")
    private boolean smtpStarttlsEnable;

    @Value("${spring.mail.properties.mail.smtp.starttls.required}")
    private boolean smtpStarttlsRequired;

    @Value("${spring.mail.properties.mail.smtp.connectiontimeout}")
    private int smtpConnectionTimeoutMs;

    @Value("${spring.mail.properties.mail.smtp.timeout}")
    private int smtpTimeoutMs;

    @Value("${spring.mail.properties.mail.smtp.writetimeout}")
    private int smtpWriteTimeoutMs;

    @Value("${app.mail.async.core-pool-size}")
    private int corePoolSize;
    @Value("${app.mail.async.max-pool-size}")
    private int maxPoolSize;
    @Value("${app.mail.async.queue-capacity}")
    private int queueCapacity;

    private BrevoApi brevo = new BrevoApi();
    private BrevoApi api = brevo;
    private AsyncConfig async = new AsyncConfig();

    @PostConstruct
    public void init() {
        syncNestedProperties();
    }

    public void syncNestedProperties() {
        if (brevo == null) {
            brevo = new BrevoApi();
        }
        brevo.setApiKey(apiKey);
        brevo.setApiUrl(apiUrl);
        brevo.setConnectTimeoutMs(connectTimeoutMs);
        brevo.setReadTimeoutMs(readTimeoutMs);
        this.api = this.brevo;

        if (async == null) {
            async = new AsyncConfig();
        }
        async.setCorePoolSize(corePoolSize);
        async.setMaxPoolSize(maxPoolSize);
        async.setQueueCapacity(queueCapacity);
    }

    public BrevoApi getApi() {
        if (brevo == null || brevo.getApiKey() == null) {
            syncNestedProperties();
        }
        return brevo != null ? brevo : api;
    }

    public void setApi(BrevoApi api) {
        this.api = api;
        this.brevo = api;
    }

    public BrevoApi getBrevo() {
        return getApi();
    }

    public void setBrevo(BrevoApi brevo) {
        this.brevo = brevo;
        this.api = brevo;
    }

    public AsyncConfig getAsync() {
        if (async == null) {
            syncNestedProperties();
        }
        return async;
    }

    public void setAsync(AsyncConfig async) {
        this.async = async;
    }

    @Data
    public static class BrevoApi {
        private String apiKey;
        private String apiUrl;
        private int connectTimeoutMs;
        private int readTimeoutMs;
    }

    @Data
    public static class AsyncConfig {
        private int corePoolSize;
        private int maxPoolSize;
        private int queueCapacity;
    }
}
