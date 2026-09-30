package com.barangay.eservices.modules.users.controller;

import com.barangay.eservices.dto.ApiResponse;
import com.barangay.eservices.dto.PaginatedResponse;
import com.barangay.eservices.modules.users.dto.CreateStaffRequest;
import com.barangay.eservices.modules.users.dto.UserDTO;
import com.barangay.eservices.modules.users.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/users")
@Tag(name = "Admin Users", description = "Personnel and user management API for Admins")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired
    private UserService userService;

    @GetMapping
    @Operation(summary = "List all users with search and pagination")
    public ResponseEntity<ApiResponse<PaginatedResponse<UserDTO>>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PaginatedResponse<UserDTO> response = userService.getAllUsers(search, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/role/{roleName}")
    @Operation(summary = "List users by role (e.g. ROLE_STAFF, ROLE_APPROVER)")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getUsersByRole(@PathVariable String roleName) {
        List<UserDTO> users = userService.getUsersByRole(roleName);
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user details by ID")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PostMapping("/staff")
    @Operation(summary = "Create a new staff or approver account")
    public ResponseEntity<ApiResponse<UserDTO>> createStaffAccount(@Valid @RequestBody CreateStaffRequest request) {
        UserDTO user = userService.createStaffAccount(request);
        return ResponseEntity.ok(ApiResponse.ok("Staff account created successfully", user));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update user account status (ACTIVE, INACTIVE, LOCKED)")
    public ResponseEntity<ApiResponse<UserDTO>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        UserDTO user = userService.updateUserStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Account status updated", user));
    }

    @PutMapping("/{id}/roles")
    @Operation(summary = "Update user roles")
    public ResponseEntity<ApiResponse<UserDTO>> updateRoles(
            @PathVariable Long id,
            @RequestBody Set<String> roles) {
        UserDTO user = userService.updateUserRoles(id, roles);
        return ResponseEntity.ok(ApiResponse.ok("User roles updated", user));
    }
}
