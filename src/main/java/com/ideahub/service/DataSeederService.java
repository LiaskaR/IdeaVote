package com.ideahub.service;

import com.ideahub.entity.Idea;
import com.ideahub.entity.User;
import com.ideahub.repository.IdeaRepository;
import com.ideahub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class DataSeederService implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private IdeaRepository ideaRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            seedUsers();
        }
        
        if (ideaRepository.count() == 0) {
            seedIdeas();
        }
    }
    
    private void seedUsers() {
        List<User> users = Arrays.asList(
            createUser("sarah_chen", "sarah@example.com", "Product Manager"),
            createUser("mike_johnson", "mike@example.com", "Developer"),
            createUser("lisa_park", "lisa@example.com", "Designer"),
            createUser("david_kim", "david@example.com", "Manager"),
            createUser("alex_rodriguez", "alex@example.com", "Developer"),
            createUser("emily_watson", "emily@example.com", "QA Engineer"),
            createUser("andrey_zakharov", "andrey@example.com", "Admin")
        );
        
        userRepository.saveAll(users);
    }
    
    private User createUser(String username, String email, String role) {
        User user = new User(username, email, passwordEncoder.encode("password"));
        user.setRole(role.toLowerCase());
        user.setIsActive("true");
        return user;
    }
    
    private void seedIdeas() {
        List<User> users = userRepository.findAll();
        
        if (users.size() >= 5) {
            List<Idea> ideas = Arrays.asList(
                createIdea(
                    "AI-Powered Customer Support Chatbot",
                    "Implement an intelligent chatbot that can handle 80% of customer inquiries automatically. This would reduce response time from hours to seconds and free up our support team for complex issues.",
                    Arrays.asList("AI", "customer service", "automation"),
                    users.get(0),
                    LocalDateTime.now().minusDays(5)
                ),
                createIdea(
                    "Mobile App Dark Mode Implementation",
                    "Add dark mode support to our mobile application. Recent user surveys show 75% of users prefer dark mode for better battery life and reduced eye strain during evening usage.",
                    Arrays.asList("mobile", "UI/UX", "accessibility"),
                    users.get(1),
                    LocalDateTime.now().minusDays(3)
                ),
                createIdea(
                    "Automated Code Review System",
                    "Set up automated code quality checks using GitHub Actions. This will catch common issues before manual review and ensure consistent coding standards across the team.",
                    Arrays.asList("DevOps", "code quality", "automation"),
                    users.get(2),
                    LocalDateTime.now().minusDays(2)
                ),
                createIdea(
                    "Real-time Collaboration Features",
                    "Add real-time collaborative editing similar to Google Docs. Users can see each other's cursors and changes instantly, improving team productivity.",
                    Arrays.asList("collaboration", "real-time", "productivity"),
                    users.get(3),
                    LocalDateTime.now().minusDays(1)
                ),
                createIdea(
                    "Performance Analytics Dashboard",
                    "Create a comprehensive dashboard showing app performance metrics, user engagement, and system health. This will help us make data-driven decisions.",
                    Arrays.asList("analytics", "dashboard", "performance"),
                    users.get(4),
                    LocalDateTime.now().minusHours(12)
                )
            );
            
            ideaRepository.saveAll(ideas);
        }
    }
    
    private Idea createIdea(String title, String description, List<String> tags, User author, LocalDateTime createdAt) {
        Idea idea = new Idea(title, description, author);
        idea.setTags(tags);
        idea.setCreatedAt(createdAt);
        return idea;
    }
}