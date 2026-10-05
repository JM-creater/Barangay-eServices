package com.barangay.eservices.modules.users.repository;

import com.barangay.eservices.modules.users.entity.RoleName;
import com.barangay.eservices.modules.users.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsernameOrEmail(String username, String email);
    Optional<User> findByUsernameIgnoreCase(String username);
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByUsernameIgnoreCaseOrEmailIgnoreCase(String username, String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    boolean existsByGoogleId(String googleId);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName")
    List<User> findByRoleName(@Param("roleName") RoleName roleName);

    @Query("SELECT u FROM User u WHERE " +
           "(:query IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) ESCAPE '\\' OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) ESCAPE '\\' OR " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) ESCAPE '\\' OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')) ESCAPE '\\')")
    Page<User> searchUsers(@Param("query") String query, Pageable pageable);
}
