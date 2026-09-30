package com.barangay.eservices.modules.users.service;

import com.barangay.eservices.dto.PaginatedResponse;
import com.barangay.eservices.modules.users.dto.CreateStaffRequest;
import com.barangay.eservices.modules.users.dto.UserDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Set;

public interface UserService {
    UserDTO getUserById(Long id);
    PaginatedResponse<UserDTO> getAllUsers(String search, Pageable pageable);
    List<UserDTO> getUsersByRole(String roleName);
    UserDTO createStaffAccount(CreateStaffRequest request);
    UserDTO updateUserStatus(Long id, String status);
    UserDTO updateUserRoles(Long id, Set<String> roles);
}
