package com.ideahub.controller;

import com.ideahub.dto.IdeaDto;
import com.ideahub.service.IdeaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ideas")
@CrossOrigin(origins = "*")
public class IdeaController {
    
    @Autowired
    private IdeaService ideaService;
    
    @GetMapping
    public ResponseEntity<List<IdeaDto>> getAllIdeas(
        @RequestParam(required = false) String sortBy,
        @RequestHeader(value = "X-User-Id", required = false) Long currentUserId
    ) {
        List<IdeaDto> ideas = ideaService.getAllIdeas(sortBy, currentUserId);
        return ResponseEntity.ok(ideas);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<IdeaDto> getIdeaById(
        @PathVariable Long id,
        @RequestHeader(value = "X-User-Id", required = false) Long currentUserId
    ) {
        Optional<IdeaDto> idea = ideaService.getIdeaById(id, currentUserId);
        
        if (idea.isPresent()) {
            return ResponseEntity.ok(idea.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<IdeaDto> createIdea(
        @RequestBody CreateIdeaRequest request,
        @RequestHeader("X-User-Id") Long currentUserId
    ) {
        IdeaDto createdIdea = ideaService.createIdea(
            request.getTitle(),
            request.getDescription(),
            request.getTags(),
            request.getImages(),
            currentUserId
        );
        
        return ResponseEntity.ok(createdIdea);
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