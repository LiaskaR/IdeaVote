package com.ideahub.controller;

import com.ideahub.dto.IdeaDto;
import com.ideahub.service.IdeaService;
import com.ideahub.security.JwtUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/ideas")
@CrossOrigin(origins = "*")
@Validated
public class IdeaController {
    
    @Autowired
    private IdeaService ideaService;
    
    @Autowired
    private JwtUserDetails jwtUserDetails;
    
    @GetMapping
    @RateLimiter(name = "ideas-read", fallbackMethod = "fallbackGetAllIdeas")
    @CircuitBreaker(name = "ideas-service", fallbackMethod = "fallbackGetAllIdeas")
    public ResponseEntity<List<IdeaDto>> getAllIdeas(
        @RequestParam(required = false) String sortBy
    ) {
        Long currentUserId = jwtUserDetails.getCurrentUserId();
        List<IdeaDto> ideas = ideaService.getAllIdeas(sortBy, currentUserId);
        return ResponseEntity.ok(ideas);
    }
    
    public ResponseEntity<List<IdeaDto>> fallbackGetAllIdeas(String sortBy, Exception ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(List.of());
    }
    
    @GetMapping("/{id}")
    @RateLimiter(name = "ideas-read", fallbackMethod = "fallbackGetIdeaById")
    @CircuitBreaker(name = "ideas-service", fallbackMethod = "fallbackGetIdeaById")
    public ResponseEntity<IdeaDto> getIdeaById(@PathVariable Long id) {
        Long currentUserId = jwtUserDetails.getCurrentUserId();
        Optional<IdeaDto> idea = ideaService.getIdeaById(id, currentUserId);
        
        if (idea.isPresent()) {
            return ResponseEntity.ok(idea.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    public ResponseEntity<IdeaDto> fallbackGetIdeaById(Long id, Exception ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
    }
    
    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @RateLimiter(name = "ideas-write", fallbackMethod = "fallbackCreateIdea")
    @CircuitBreaker(name = "ideas-service", fallbackMethod = "fallbackCreateIdea")
    public ResponseEntity<IdeaDto> createIdea(@RequestBody @Validated CreateIdeaRequest request) {
        Long currentUserId = jwtUserDetails.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        IdeaDto createdIdea = ideaService.createIdea(
            request.getTitle(),
            request.getDescription(),
            request.getTags(),
            request.getImages(),
            currentUserId
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(createdIdea);
    }
    
    public ResponseEntity<IdeaDto> fallbackCreateIdea(CreateIdeaRequest request, Exception ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<IdeaDto> updateIdea(
        @PathVariable Long id,
        @RequestBody CreateIdeaRequest request
    ) {
        Optional<IdeaDto> updatedIdea = ideaService.updateIdea(
            id,
            request.getTitle(),
            request.getDescription(),
            request.getTags(),
            request.getImages()
        );
        
        if (updatedIdea.isPresent()) {
            return ResponseEntity.ok(updatedIdea.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteIdea(@PathVariable Long id) {
        boolean deleted = ideaService.deleteIdea(id);
        
        if (deleted) {
            return ResponseEntity.ok(Map.of("success", true));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Request DTOs
    public static class CreateIdeaRequest {
        private String title;
        private String description;
        private List<String> tags;
        private List<String> images;
        
        // Getters and Setters
        public String getTitle() {
            return title;
        }
        
        public void setTitle(String title) {
            this.title = title;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
        
        public List<String> getTags() {
            return tags;
        }
        
        public void setTags(List<String> tags) {
            this.tags = tags;
        }
        
        public List<String> getImages() {
            return images;
        }
        
        public void setImages(List<String> images) {
            this.images = images;
        }
    }
}