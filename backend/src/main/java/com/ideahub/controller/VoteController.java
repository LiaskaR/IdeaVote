package com.ideahub.controller;

import com.ideahub.service.VoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ideas/{ideaId}/vote")
public class VoteController {
    
    @Autowired
    private VoteService voteService;
    
    @PostMapping
    public ResponseEntity<Map<String, Long>> vote(@PathVariable Long ideaId, @RequestBody Map<String, String> request) {
        try {
            String type = request.get("type");
            if (!"up".equals(type) && !"down".equals(type)) {
                return ResponseEntity.badRequest().build();
            }
            
            Map<String, Long> counts = voteService.vote(ideaId, type);
            return ResponseEntity.ok(counts);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping
    public ResponseEntity<Map<String, Long>> removeVote(@PathVariable Long ideaId) {
        try {
            voteService.removeVote(ideaId);
            Map<String, Long> counts = voteService.getVoteCounts(ideaId);
            return ResponseEntity.ok(counts);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}