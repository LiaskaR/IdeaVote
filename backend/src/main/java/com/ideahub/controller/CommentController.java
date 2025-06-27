package com.ideahub.controller;

import com.ideahub.dto.CommentDTO;
import com.ideahub.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class CommentController {
    
    @Autowired
    private CommentService commentService;
    
    @GetMapping("/ideas/{ideaId}/comments")
    public ResponseEntity<List<CommentDTO>> getCommentsByIdeaId(@PathVariable Long ideaId) {
        List<CommentDTO> comments = commentService.getCommentsByIdeaId(ideaId);
        return ResponseEntity.ok(comments);
    }
    
    @PostMapping("/ideas/{ideaId}/comments")
    public ResponseEntity<CommentDTO> createComment(@PathVariable Long ideaId, @Valid @RequestBody CommentDTO commentDTO) {
        try {
            CommentDTO createdComment = commentService.createComment(ideaId, commentDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        try {
            commentService.deleteComment(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Not authorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        }
    }
}