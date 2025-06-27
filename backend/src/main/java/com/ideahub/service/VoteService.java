package com.ideahub.service;

import com.ideahub.dto.UserDTO;
import com.ideahub.model.Idea;
import com.ideahub.model.User;
import com.ideahub.model.Vote;
import com.ideahub.repository.IdeaRepository;
import com.ideahub.repository.UserRepository;
import com.ideahub.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class VoteService {
    
    @Autowired
    private VoteRepository voteRepository;
    
    @Autowired
    private IdeaRepository ideaRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserService userService;
    
    public Map<String, Long> vote(Long ideaId, String voteType) {
        UserDTO currentUser = userService.getCurrentUser();
        
        Idea idea = ideaRepository.findById(ideaId)
            .orElseThrow(() -> new RuntimeException("Idea not found"));
        
        User user = userRepository.findById(currentUser.getId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Vote.VoteType type = "up".equals(voteType) ? Vote.VoteType.UP : Vote.VoteType.DOWN;
        
        Optional<Vote> existingVote = voteRepository.findByIdeaIdAndUserId(ideaId, currentUser.getId());
        
        if (existingVote.isPresent()) {
            Vote vote = existingVote.get();
            if (vote.getType() == type) {
                // Same vote type - remove vote
                voteRepository.delete(vote);
            } else {
                // Different vote type - update
                vote.setType(type);
                voteRepository.save(vote);
            }
        } else {
            // New vote
            Vote vote = new Vote(idea, user, type);
            voteRepository.save(vote);
        }
        
        return getVoteCounts(ideaId);
    }
    
    public boolean removeVote(Long ideaId) {
        UserDTO currentUser = userService.getCurrentUser();
        
        Optional<Vote> existingVote = voteRepository.findByIdeaIdAndUserId(ideaId, currentUser.getId());
        if (existingVote.isPresent()) {
            voteRepository.delete(existingVote.get());
            return true;
        }
        
        return false;
    }
    
    public Map<String, Long> getVoteCounts(Long ideaId) {
        long upvotes = voteRepository.countByIdeaIdAndType(ideaId, Vote.VoteType.UP);
        long downvotes = voteRepository.countByIdeaIdAndType(ideaId, Vote.VoteType.DOWN);
        
        Map<String, Long> counts = new HashMap<>();
        counts.put("upvotes", upvotes);
        counts.put("downvotes", downvotes);
        
        return counts;
    }
}