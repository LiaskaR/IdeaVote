package com.ideahub.repository;

import com.ideahub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    
    @Query("SELECT COUNT(DISTINCT u.id) FROM User u WHERE u.lastLogin IS NOT NULL")
    long countActiveUsers();
}