package com.ideahub.controller;

import com.ideahub.dto.CommentDto;
import com.ideahub.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*")
public class CommentController {
    
    @Autowired
    private CommentService commentService;
    
    @GetMapping("/idea/{ideaId}")
    public ResponseEntity<List<CommentDto>> getCommentsByIdeaId(@PathVariable Long ideaId) {
        List<CommentDto> comments = commentService.getCommentsByIdeaId(ideaId);
        return ResponseEntity.ok(comments);
    }
    
    @PostMapping
    public ResponseEntity<CommentDto> createComment(
        @RequestBody CommentRequest request,
        @RequestHeader("X-User-Id") Long currentUserId
    ) {
        CommentDto comment = commentService.createComment(
            request.getIdeaId(),
            currentUserId,
            request.getContent()
        );
        
        return ResponseEntity.ok(comment);
    }
    
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Map<String, Boolean>> deleteComment(
        @PathVariable Long commentId,
        @RequestHeader("X-User-Id") Long currentUserId
    ) {
        boolean deleted = commentService.deleteComment(commentId, currentUserId);
        
        return ResponseEntity.ok(Map.of("success", deleted));
    }
    
    // Request DTOs
    public static class CommentRequest {
        private Long ideaId;
        private String content;
        
        // Getters and Setters
        public Long getIdeaId() {
            return ideaId;
        }
        
        public void setIdeaId(Long ideaId) {
            this.ideaId = ideaId;
        }
        
        public String getContent() {
            return content;
        }
        
        public void setContent(String content) {
            this.content = content;
        }
    }
}