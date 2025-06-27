package com.ideahub.service;

import com.ideahub.dto.UserDTO;
import com.ideahub.model.User;
import com.ideahub.repository.UserRepository;
import org.keycloak.KeycloakPrincipal;
import org.keycloak.KeycloakSecurityContext;
import org.keycloak.representations.AccessToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public UserDTO getCurrentUser() {
        KeycloakPrincipal<?> principal = (KeycloakPrincipal<?>) SecurityContextHolder
            .getContext().getAuthentication().getPrincipal();
        
        KeycloakSecurityContext context = principal.getKeycloakSecurityContext();
        AccessToken token = context.getToken();
        
        String userId = token.getSubject();
        User user = userRepository.findById(userId).orElse(null);
        
        if (user == null) {
            // Create new user from Keycloak token
            user = createUserFromToken(token);
        } else {
            // Update last login
            user.setLastLogin(LocalDateTime.now());
            user = userRepository.save(user);
        }
        
        return convertToDTO(user);
    }
    
    public UserDTO getUserById(String id) {
        Optional<User> user = userRepository.findById(id);
        return user.map(this::convertToDTO).orElse(null);
    }
    
    public UserDTO getUserByUsername(String username) {
        Optional<User> user = userRepository.findByUsername(username);
        return user.map(this::convertToDTO).orElse(null);
    }
    
    private User createUserFromToken(AccessToken token) {
        User user = new User();
        user.setId(token.getSubject());
        user.setUsername(token.getPreferredUsername());
        user.setEmail(token.getEmail());
        user.setFirstName(token.getGivenName());
        user.setLastName(token.getFamilyName());
        user.setLastLogin(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setProfileImageUrl(user.getProfileImageUrl());
        dto.setLastLogin(user.getLastLogin());
        dto.setCreatedAt(user.getCreatedAt());
        
        return dto;
    }
}