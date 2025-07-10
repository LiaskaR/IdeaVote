package com.ideahub.controller;

import com.ideahub.repository.CommentRepository;
import com.ideahub.repository.IdeaRepository;
import com.ideahub.repository.UserRepository;
import com.ideahub.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
public class StatsController {
    
    @Autowired
    private IdeaRepository ideaRepository;
    
    @Autowired
    private VoteRepository voteRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CommentRepository commentRepository;
    
    @GetMapping
    public ResponseEntity<Map<String, Long>> getStats() {
        long totalIdeas = ideaRepository.count();
        long totalVotes = voteRepository.count();
        long activeUsers = userRepository.count();
        
        Map<String, Long> stats = Map.of(
            "totalIdeas", totalIdeas,
            "totalVotes", totalVotes,
            "activeUsers", activeUsers
        );
        
        return ResponseEntity.ok(stats);
    }
}