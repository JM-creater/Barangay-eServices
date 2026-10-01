package com.barangay.eservices.config;

import com.barangay.eservices.security.ratelimit.RateLimitingFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration that registers RateLimitingFilter strictly within the Spring Security
 * filter chain, preventing duplicated execution in the outer servlet container.
 */
@Configuration
public class RateLimitingConfig {

    /**
     * Disables automatic servlet container registration for RateLimitingFilter.
     * Ensures it only executes inside Spring Security after JwtAuthenticationFilter.
     */
    @Bean
    public FilterRegistrationBean<RateLimitingFilter> rateLimitingFilterRegistration(RateLimitingFilter filter) {
        FilterRegistrationBean<RateLimitingFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }
}
