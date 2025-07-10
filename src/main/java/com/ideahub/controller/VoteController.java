package com.ideahub.controller;

import com.ideahub.entity.Vote;
import com.ideahub.service.VoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/votes")
@CrossOrigin(origins = "*")
public class VoteController {
    
    @Autowired
    private VoteService voteService;
    
    @PostMapping
    public ResponseEntity<Vote> createOrUpdateVote(
        @RequestBody VoteRequest request,
        @RequestHeader("X-User-Id") Long currentUserId
    ) {
        Vote vote = voteService.createOrUpdateVote(
            request.getIdeaId(),
            currentUserId,
            request.getType()
        );
        
        return ResponseEntity.ok(vote);
    }
    
    @DeleteMapping("/{ideaId}")
    public ResponseEntity<Map<String, Boolean>> deleteVote(
        @PathVariable Long ideaId,
        @RequestHeader("X-User-Id") Long currentUserId
    ) {
        boolean deleted = voteService.deleteVote(ideaId, currentUserId);
        
        return ResponseEntity.ok(Map.of("success", deleted));
    }
    
    @GetMapping("/{ideaId}/stats")
    public ResponseEntity<VoteService.VoteStats> getVoteStats(@PathVariable Long ideaId) {
        VoteService.VoteStats stats = voteService.getVoteStats(ideaId);
        return ResponseEntity.ok(stats);
    }
    
    // Request DTOs
    public static class VoteRequest {
        private Long ideaId;
        private String type; // "up" or "down"
        
        // Getters and Setters
        public Long getIdeaId() {
            return ideaId;
        }
        
        public void setIdeaId(Long ideaId) {
            this.ideaId = ideaId;
        }
        
        public String getType() {
            return type;
        }
        
        public void setType(String type) {
            this.type = type;
        }
    }
}