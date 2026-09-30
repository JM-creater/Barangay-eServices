package com.barangay.eservices.modules.users.controller;

import com.barangay.eservices.dto.ApiResponse;
import com.barangay.eservices.modules.users.dto.UserDTO;
import com.barangay.eservices.modules.users.service.UserService;
import com.barangay.eservices.security.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "User profile operations")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Get user profile")
    public ResponseEntity<ApiResponse<UserDTO>> getProfile() {
        Long userId = SecurityUtil.getCurrentUserId();
        UserDTO user = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }
}
