package com.barangay.eservices.modules.users.controller;

import com.barangay.eservices.dto.ApiResponse;
import com.barangay.eservices.modules.users.dto.AuthRequest;
import com.barangay.eservices.modules.users.dto.AuthResponse;
import com.barangay.eservices.modules.users.dto.ChangePasswordRequest;
import com.barangay.eservices.modules.users.dto.RegisterRequest;
import com.barangay.eservices.modules.users.dto.UserDTO;
import com.barangay.eservices.modules.users.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Registration, Login, and Profile API")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login with username/email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Register new resident account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        AuthResponse response = authService.register(registerRequest);
        return ResponseEntity.ok(ApiResponse.ok("Registration successful", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser() {
        UserDTO user = authService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password for logged-in user")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully", null));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Initiate password recovery / request reset token")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody com.barangay.eservices.modules.users.dto.ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("If an account matches your details, password recovery instructions and token have been issued.", null));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using recovery token")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody com.barangay.eservices.modules.users.dto.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Password has been reset successfully. You may now log in with your new password.", null));
    }
}
