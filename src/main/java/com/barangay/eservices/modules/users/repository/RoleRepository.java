package com.barangay.eservices.modules.users.repository;

import com.barangay.eservices.modules.users.entity.Role;
import com.barangay.eservices.modules.users.entity.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
    boolean existsByName(RoleName name);
}
