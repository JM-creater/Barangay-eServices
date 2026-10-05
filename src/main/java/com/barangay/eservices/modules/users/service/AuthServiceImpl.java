package com.barangay.eservices.modules.users.service;

import com.barangay.eservices.exception.BadRequestException;
import com.barangay.eservices.exception.ResourceNotFoundException;
import com.barangay.eservices.modules.audit.service.AuditLogService;
import com.barangay.eservices.modules.notifications.service.EmailService;
import com.barangay.eservices.modules.notifications.service.EmailTemplateBuilder;
import com.barangay.eservices.modules.users.dto.AuthRequest;
import com.barangay.eservices.modules.users.dto.AuthResponse;
import com.barangay.eservices.modules.users.dto.ChangePasswordRequest;
import com.barangay.eservices.modules.users.dto.RegisterRequest;
import com.barangay.eservices.modules.users.dto.TokenValidationResponse;
import com.barangay.eservices.modules.users.dto.UserDTO;
import com.barangay.eservices.modules.users.entity.Role;
import com.barangay.eservices.modules.users.entity.RoleName;
import com.barangay.eservices.modules.users.entity.User;
import com.barangay.eservices.modules.users.mapper.UserMapper;
import com.barangay.eservices.modules.users.repository.RoleRepository;
import com.barangay.eservices.modules.users.repository.UserRepository;
import com.barangay.eservices.security.JwtTokenProvider;
import com.barangay.eservices.security.SecurityUtil;
import com.barangay.eservices.security.UserPrincipal;
import com.barangay.eservices.modules.notifications.entity.NotificationType;
import com.barangay.eservices.modules.notifications.service.NotificationService;
import com.barangay.eservices.modules.users.dto.ForgotPasswordRequest;
import com.barangay.eservices.modules.users.dto.ResetPasswordRequest;
import com.barangay.eservices.modules.users.entity.PasswordResetToken;
import com.barangay.eservices.modules.users.repository.PasswordResetTokenRepository;
import com.barangay.eservices.modules.users.dto.GoogleLoginRequest;
import com.barangay.eservices.modules.users.dto.GoogleRegisterRequest;
import com.barangay.eservices.modules.users.dto.GoogleTokenVerifyRequest;
import com.barangay.eservices.modules.users.dto.GoogleTokenVerificationResponse;
import com.barangay.eservices.security.oauth.GoogleOAuthService;
import com.barangay.eservices.security.oauth.GoogleUserInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtTokenProvider tokenProvider;
    @Autowired
    private AuditLogService auditLogService;
    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private EmailTemplateBuilder templateBuilder;
    @Autowired
    private EmailService emailService;
    @Autowired
    private GoogleOAuthService googleOAuthService;

    @Override
    public AuthResponse login(AuthRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsernameOrEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        auditLogService.logAction(user, "USER_LOGIN", "User", user.getId().toString(), "User logged in successfully");

        return new AuthResponse(jwt, UserMapper.toDTO(user));
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BadRequestException("Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email is already in use!");
        }

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFirstName(registerRequest.getFirstName());
        user.setMiddleName(registerRequest.getMiddleName());
        user.setLastName(registerRequest.getLastName());
        user.setSuffix(registerRequest.getSuffix());
        user.setContactNumber(registerRequest.getContactNumber());
        user.setAddress(registerRequest.getAddress());
        user.setBarangay(registerRequest.getBarangay() != null ? registerRequest.getBarangay() : "Cansojong");
        user.setCity(registerRequest.getCity() != null ? registerRequest.getCity() : "Talisay City");
        user.setProvince(registerRequest.getProvince() != null ? registerRequest.getProvince() : "Cebu");
        user.setAccountStatus("ACTIVE");

        Role residentRole = roleRepository.findByName(RoleName.ROLE_RESIDENT)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_RESIDENT)));

        user.setRoles(Collections.singleton(residentRole));
        User savedUser = userRepository.save(user);

        if (savedUser.getEmail() != null && !savedUser.getEmail().isBlank()) {
            String fullName = ((savedUser.getFirstName() != null ? savedUser.getFirstName() : "") + " " +
                    (savedUser.getLastName() != null ? savedUser.getLastName() : "")).trim();
            String welcomeHtml = templateBuilder.buildWelcomeTemplate(
                    fullName.isEmpty() ? savedUser.getUsername() : fullName,
                    savedUser.getUsername());
            emailService.sendHtmlEmail(savedUser.getEmail(), savedUser.getFirstName(),
                    "Welcome to Barangay Cansojong e-Services", welcomeHtml);
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        registerRequest.getUsername(),
                        registerRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        auditLogService.logAction(savedUser, "RESIDENT_REGISTERED", "User", savedUser.getId().toString(), "Resident registered: " + savedUser.getUsername());

        return new AuthResponse(jwt, UserMapper.toDTO(savedUser));
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getCurrentUserProfile() {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            throw new BadRequestException("No authenticated user found");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return UserMapper.toDTO(user);
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditLogService.logAction(user, "PASSWORD_CHANGED", "User", user.getId().toString(), "Password changed successfully");
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String identifier = request.getEmailOrUsername().trim();
        Optional<User> userOpt = userRepository.findByUsernameIgnoreCase(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmailIgnoreCase(identifier);
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            passwordResetTokenRepository.deleteByUser(user);

            String token = UUID.randomUUID().toString();
            String resetHtml = templateBuilder.buildPasswordResetTemplate(user.getUsername(), token);
            LocalDateTime expiry = LocalDateTime.now().plusHours(2);
            PasswordResetToken resetToken = new PasswordResetToken(token, user, expiry);
            passwordResetTokenRepository.save(resetToken);

            if (user.getEmail() != null && !user.getEmail().isBlank()) {
                emailService.sendHtmlEmail(user.getEmail(), user.getFirstName(),
                        "Password Reset Request - Barangay Cansojong", resetHtml);
            }

            notificationService.sendNotification(user, "Password Reset Request",
                    "A password reset request was initiated for your account. A secure reset link has been dispatched to your registered email address. If you did not make this request, please contact barangay administration immediately.",
                    NotificationType.GENERAL, null);

            auditLogService.logAction(user, "FORGOT_PASSWORD_REQUESTED", "User", user.getId().toString(),
                    "Password reset token issued for user: " + user.getUsername());
        }
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenAndUsedFalse(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or already used password reset token"));

        if (resetToken.isExpired()) {
            throw new BadRequestException("Password reset token has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            String securityNoticeHtml = templateBuilder.buildGeneralNotificationTemplate(
                    "Security Alert: Password Changed Successfully",
                    "Your account password was successfully reset. If you did not make this change, please contact barangay administration immediately."
            );
            emailService.sendHtmlEmail(user.getEmail(), user.getFirstName(),
                    "Security Alert: Password Changed Successfully", securityNoticeHtml);
        }

        notificationService.sendNotification(user, "Password Reset Successful",
                "Your account password was successfully reset. If you did not make this change, please contact barangay administration immediately.",
                NotificationType.GENERAL, null);

        auditLogService.logAction(user, "PASSWORD_RESET_COMPLETED", "User", user.getId().toString(),
                "Password reset completed with token");
    }

    @Override
    @Transactional(readOnly = true)
    public TokenValidationResponse validateResetToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            return TokenValidationResponse.invalid("Password reset token is missing. Please use the link sent to your email.");
        }

        String trimmedToken = token.trim();

        Optional<PasswordResetToken> resetToken = passwordResetTokenRepository.findByToken(trimmedToken);

        if (resetToken.isEmpty()) {
            return TokenValidationResponse.invalid("This password reset link is invalid, has expired, or has already been used.");
        }

        PasswordResetToken resetTokenOpt = resetToken.get();

        if (Boolean.TRUE.equals(resetTokenOpt.getUsed())) {
            return TokenValidationResponse.invalid("This password reset link has already been used. Please request a new link.");
        }

        // Check if token exceeded its expiration window (2 hours)
        if (resetTokenOpt.isExpired()) {
            return TokenValidationResponse.invalid("This password reset link has expired. For your security, reset links are valid for 2 hours.");
        }

        return TokenValidationResponse.valid();
    }

    @Override
    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleUserInfo googleUser = googleOAuthService.verifyToken(request.getIdToken());

        // First find by Google ID, then find by email
        Optional<User> userOpt = userRepository.findByGoogleId(googleUser.getSub());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmailIgnoreCase(googleUser.getEmail());
        }

        // CRITICAL: If user is not yet registered, this will not proceed
        if (userOpt.isEmpty()) {
            throw new BadRequestException("No registered account found for this Google email (" 
                    + googleUser.getEmail() + "). Please register first before signing in.");
        }

        User user = userOpt.get();

        if (!"ACTIVE".equalsIgnoreCase(user.getAccountStatus())) {
            throw new BadRequestException("Your account is currently " + user.getAccountStatus() + ". Please contact the Barangay administration.");
        }

        boolean updated = false;
        if (user.getGoogleId() == null || user.getGoogleId().isBlank()) {
            user.setGoogleId(googleUser.getSub());
            updated = true;
        }
        if (user.getProfilePictureUrl() == null && googleUser.getPictureUrl() != null) {
            user.setProfilePictureUrl(googleUser.getPictureUrl());
            updated = true;
        }
        if (updated) {
            userRepository.save(user);
        }

        UserPrincipal principal = UserPrincipal.create(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                principal,
                null,
                principal.getAuthorities()
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        auditLogService.logAction(user, "USER_LOGIN_GOOGLE", "User", user.getId().toString(),
                "User logged in via Google OAuth: " + user.getEmail());

        return new AuthResponse(jwt, UserMapper.toDTO(user));
    }

    @Override
    @Transactional(readOnly = true)
    public GoogleTokenVerificationResponse verifyGoogleToken(GoogleTokenVerifyRequest request) {
        GoogleUserInfo googleUser = googleOAuthService.verifyToken(request.getIdToken());
        String email = googleUser.getEmail().toLowerCase().trim();

        boolean registered = userRepository.findByGoogleId(googleUser.getSub()).isPresent()
                || userRepository.existsByEmail(email);

        String suggestedUsername = generateSuggestedUsername(email, googleUser.getGivenName(), googleUser.getFamilyName());

        return GoogleTokenVerificationResponse.builder()
                .registered(registered)
                .email(email)
                .firstName(googleUser.getGivenName())
                .lastName(googleUser.getFamilyName())
                .pictureUrl(googleUser.getPictureUrl())
                .suggestedUsername(suggestedUsername)
                .message(registered ? "An account with this Google email already exists. Please log in." : "Google account verified.")
                .build();
    }

    @Override
    @Transactional
    public AuthResponse registerWithGoogle(GoogleRegisterRequest request) {
        GoogleUserInfo googleUser = googleOAuthService.verifyToken(request.getIdToken());
        String email = googleUser.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with email " + email + " already exists. Please log in instead.");
        }

        if (userRepository.existsByUsername(request.getUsername().trim())) {
            throw new BadRequestException("Username is already taken!");
        }

        if (userRepository.findByGoogleId(googleUser.getSub()).isPresent()) {
            throw new BadRequestException("This Google account is already linked to an existing profile. Please log in.");
        }

        String firstName = request.getFirstName() != null && !request.getFirstName().isBlank()
                ? request.getFirstName().trim()
                : googleUser.getGivenName();
        String lastName = request.getLastName() != null && !request.getLastName().isBlank()
                ? request.getLastName().trim()
                : googleUser.getFamilyName();

        if (firstName == null || firstName.isBlank()) {
            throw new BadRequestException("First name is required");
        }
        if (lastName == null || lastName.isBlank()) {
            throw new BadRequestException("Last name is required");
        }
        if (request.getContactNumber() == null || request.getContactNumber().isBlank()) {
            throw new BadRequestException("Contact number is required");
        }
        if (request.getAddress() == null || request.getAddress().isBlank()) {
            throw new BadRequestException("Address is required");
        }

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setFirstName(firstName);
        user.setMiddleName(request.getMiddleName() != null ? request.getMiddleName().trim() : null);
        user.setLastName(lastName);
        user.setSuffix(request.getSuffix() != null ? request.getSuffix().trim() : null);
        user.setContactNumber(request.getContactNumber().trim());
        user.setAddress(request.getAddress().trim());
        user.setBarangay(request.getBarangay() != null && !request.getBarangay().isBlank() ? request.getBarangay().trim() : "Cansojong");
        user.setCity(request.getCity() != null && !request.getCity().isBlank() ? request.getCity().trim() : "Talisay City");
        user.setProvince(request.getProvince() != null && !request.getProvince().isBlank() ? request.getProvince().trim() : "Cebu");
        user.setAccountStatus("ACTIVE");
        user.setAuthProvider("GOOGLE");
        user.setGoogleId(googleUser.getSub());
        user.setProfilePictureUrl(googleUser.getPictureUrl());

        Role residentRole = roleRepository.findByName(RoleName.ROLE_RESIDENT)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_RESIDENT)));
        user.setRoles(Collections.singleton(residentRole));

        User savedUser = userRepository.save(user);

        if (savedUser.getEmail() != null && !savedUser.getEmail().isBlank()) {
            String fullName = ((savedUser.getFirstName() != null ? savedUser.getFirstName() : "") + " " +
                    (savedUser.getLastName() != null ? savedUser.getLastName() : "")).trim();
            String welcomeHtml = templateBuilder.buildWelcomeTemplate(
                    fullName.isEmpty() ? savedUser.getUsername() : fullName,
                    savedUser.getUsername());
            emailService.sendHtmlEmail(savedUser.getEmail(), savedUser.getFirstName(),
                    "Welcome to Barangay Cansojong e-Services", welcomeHtml);
        }

        UserPrincipal principal = UserPrincipal.create(savedUser);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                principal,
                null,
                principal.getAuthorities()
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        auditLogService.logAction(savedUser, "RESIDENT_REGISTERED_GOOGLE", "User", savedUser.getId().toString(),
                "Resident registered via Google OAuth: " + savedUser.getUsername());

        return new AuthResponse(jwt, UserMapper.toDTO(savedUser));
    }

    private String generateSuggestedUsername(String email, String firstName, String lastName) {
        String base = email.split("@")[0].replaceAll("[^a-zA-Z0-9._-]", "");
        if (base.length() < 3) {
            base = ((firstName != null ? firstName : "") + (lastName != null ? lastName : "")).replaceAll("[^a-zA-Z0-9._-]", "").toLowerCase();
        }
        if (base.length() < 3) {
            base = "resident" + (System.currentTimeMillis() % 10000);
        }
        if (base.length() > 40) {
            base = base.substring(0, 40);
        }
        String candidate = base;
        int counter = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + counter;
            counter++;
        }
        return candidate;
    }
}
