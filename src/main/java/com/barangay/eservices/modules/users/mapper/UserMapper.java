package com.barangay.eservices.modules.users.mapper;

import com.barangay.eservices.modules.users.dto.UserDTO;
import com.barangay.eservices.modules.users.entity.Role;
import com.barangay.eservices.modules.users.entity.User;

import java.util.stream.Collectors;

public class UserMapper {

    public static UserDTO toDTO(User user) {
        if (user == null) {
            return null;
        }

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setMiddleName(user.getMiddleName());
        dto.setLastName(user.getLastName());
        dto.setSuffix(user.getSuffix());
        dto.setFullName(user.getFullName());
        dto.setContactNumber(user.getContactNumber());
        dto.setAddress(user.getAddress());
        dto.setBarangay(user.getBarangay());
        dto.setCity(user.getCity());
        dto.setProvince(user.getProvince());
        dto.setAccountStatus(user.getAccountStatus());
        dto.setAuthProvider(user.getAuthProvider());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        dto.setCreatedAt(user.getCreatedAt());

        if (user.getRoles() != null) {
            dto.setRoles(user.getRoles().stream()
                    .map(Role::getName)
                    .map(Enum::name)
                    .collect(Collectors.toSet()));
        }

        return dto;
    }
}
