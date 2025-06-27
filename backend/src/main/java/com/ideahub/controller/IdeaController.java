package com.ideahub.controller;

import com.ideahub.dto.IdeaDTO;
import com.ideahub.service.IdeaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ideas")
public class IdeaController {
    
    @Autowired
    private IdeaService ideaService;
    
    @GetMapping
    public ResponseEntity<List<IdeaDTO>> getAllIdeas(@RequestParam(required = false) String sortBy) {
        List<IdeaDTO> ideas = ideaService.getAllIdeas(sortBy);
        return ResponseEntity.ok(ideas);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<IdeaDTO> getIdeaById(@PathVariable Long id) {
        IdeaDTO idea = ideaService.getIdeaById(id);
        if (idea != null) {
            return ResponseEntity.ok(idea);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping
    public ResponseEntity<IdeaDTO> createIdea(@Valid @RequestBody IdeaDTO ideaDTO) {
        try {
            IdeaDTO createdIdea = ideaService.createIdea(ideaDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdIdea);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<IdeaDTO> updateIdea(@PathVariable Long id, @Valid @RequestBody IdeaDTO ideaDTO) {
        try {
            IdeaDTO updatedIdea = ideaService.updateIdea(id, ideaDTO);
            return ResponseEntity.ok(updatedIdea);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Not authorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIdea(@PathVariable Long id) {
        try {
            ideaService.deleteIdea(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Not authorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}