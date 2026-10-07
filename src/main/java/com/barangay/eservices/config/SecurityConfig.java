package com.barangay.eservices.config;

import com.barangay.eservices.security.CustomAccessDeniedHandler;
import com.barangay.eservices.security.CustomUserDetailsService;
import com.barangay.eservices.security.JwtAuthenticationEntryPoint;
import com.barangay.eservices.security.JwtAuthenticationFilter;
import com.barangay.eservices.security.ratelimit.RateLimitingFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;
    private final RateLimitingFilter rateLimitingFilter;

    public SecurityConfig(CustomUserDetailsService userDetailsService,
                          JwtAuthenticationEntryPoint unauthorizedHandler,
                          CustomAccessDeniedHandler accessDeniedHandler,
                          JwtAuthenticationFilter jwtAuthenticationFilter,
                          CorsConfigurationSource corsConfigurationSource,
                          RateLimitingFilter rateLimitingFilter) {
        this.userDetailsService = userDetailsService;
        this.unauthorizedHandler = unauthorizedHandler;
        this.accessDeniedHandler = accessDeniedHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.corsConfigurationSource = corsConfigurationSource;
        this.rateLimitingFilter = rateLimitingFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(unauthorizedHandler)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/", "/api", "/api/health").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/services/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/appointments/available-slots").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/requests/track/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/files/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/api/ai/predict", "/api/ai/model-status", "/api/ai/assistant/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        // Swagger & API docs
                        .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // AI Staff endpoints
                        .requestMatchers("/api/ai/generate-remarks", "/api/ai/model-reload").hasAnyRole("STAFF", "APPROVER", "ADMIN")
                        // Staff endpoints
                        .requestMatchers("/api/staff/**").hasAnyRole("STAFF", "APPROVER", "ADMIN")
                        // Approver endpoints
                        .requestMatchers("/api/approver/**").hasAnyRole("APPROVER", "ADMIN")
                        // Reports endpoints
                        .requestMatchers("/api/reports/**").hasAnyRole("STAFF", "APPROVER", "ADMIN")
                        // Admin endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterAfter(rateLimitingFilter, JwtAuthenticationFilter.class);

        return http.build();
    }
}
