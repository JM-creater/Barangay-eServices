package com.barangay.eservices.modules.users.service;

import com.barangay.eservices.dto.PaginatedResponse;
import com.barangay.eservices.exception.BadRequestException;
import com.barangay.eservices.exception.ResourceNotFoundException;
import com.barangay.eservices.modules.audit.service.AuditLogService;
import com.barangay.eservices.modules.users.dto.CreateStaffRequest;
import com.barangay.eservices.modules.users.dto.UserDTO;
import com.barangay.eservices.modules.users.entity.Role;
import com.barangay.eservices.modules.users.entity.RoleName;
import com.barangay.eservices.modules.users.entity.User;
import com.barangay.eservices.modules.users.mapper.UserMapper;
import com.barangay.eservices.modules.users.repository.RoleRepository;
import com.barangay.eservices.modules.users.repository.UserRepository;
import com.barangay.eservices.security.SecurityUtil;
import com.barangay.eservices.util.SqlSearchUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return UserMapper.toDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<UserDTO> getAllUsers(String search, Pageable pageable) {
        String sanitizedSearch = SqlSearchUtil.escapeLikeWildcards(search);
        Page<User> page = userRepository.searchUsers(sanitizedSearch, pageable);
        List<UserDTO> dtoList = page.getContent().stream()
                .map(UserMapper::toDTO)
                .collect(Collectors.toList());

        return new PaginatedResponse<>(
                dtoList,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByRole(String roleName) {
        RoleName enumRole = RoleName.valueOf(roleName.toUpperCase());
        return userRepository.findByRoleName(enumRole).stream()
                .map(UserMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserDTO createStaffAccount(CreateStaffRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setMiddleName(request.getMiddleName());
        user.setLastName(request.getLastName());
        user.setSuffix(request.getSuffix());
        user.setContactNumber(request.getContactNumber());
        user.setAddress("Barangay Hall, Cansojong, Talisay City, Cebu");
        user.setAccountStatus("ACTIVE");

        RoleName roleNameEnum;
        try {
            roleNameEnum = RoleName.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + request.getRole());
        }

        Role role = roleRepository.findByName(roleNameEnum)
                .orElseGet(() -> roleRepository.save(new Role(roleNameEnum)));

        user.setRoles(new HashSet<>(List.of(role)));
        User savedUser = userRepository.save(user);

        User currentUser = SecurityUtil.getCurrentUserId() != null 
                ? userRepository.findById(SecurityUtil.getCurrentUserId()).orElse(null) : null;
        auditLogService.logAction(currentUser, "STAFF_ACCOUNT_CREATED", "User", savedUser.getId().toString(),
                "Created account " + savedUser.getUsername() + " with role " + roleNameEnum);

        return UserMapper.toDTO(savedUser);
    }

    @Override
    @Transactional
    public UserDTO updateUserStatus(Long id, String status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setAccountStatus(status.toUpperCase());
        User updated = userRepository.save(user);

        User currentUser = SecurityUtil.getCurrentUserId() != null 
                ? userRepository.findById(SecurityUtil.getCurrentUserId()).orElse(null) : null;
        auditLogService.logAction(currentUser, "USER_STATUS_UPDATED", "User", id.toString(), "Status changed to " + status);

        return UserMapper.toDTO(updated);
    }

    @Override
    @Transactional
    public UserDTO updateUserRoles(Long id, Set<String> roles) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        Set<Role> roleEntities = new HashSet<>();
        for (String roleNameStr : roles) {
            RoleName rName = RoleName.valueOf(roleNameStr.toUpperCase());
            Role r = roleRepository.findByName(rName)
                    .orElseGet(() -> roleRepository.save(new Role(rName)));
            roleEntities.add(r);
        }

        user.setRoles(roleEntities);
        User updated = userRepository.save(user);

        User currentUser = SecurityUtil.getCurrentUserId() != null 
                ? userRepository.findById(SecurityUtil.getCurrentUserId()).orElse(null) : null;
        auditLogService.logAction(currentUser, "USER_ROLES_UPDATED", "User", id.toString(), "Roles updated to " + roles);

        return UserMapper.toDTO(updated);
    }
}
