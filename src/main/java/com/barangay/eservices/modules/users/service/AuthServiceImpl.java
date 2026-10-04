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
}
