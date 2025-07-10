package com.ideahub.service;

import com.ideahub.entity.Idea;
import com.ideahub.entity.User;
import com.ideahub.entity.Vote;
import com.ideahub.repository.IdeaRepository;
import com.ideahub.repository.UserRepository;
import com.ideahub.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    
    public Vote createOrUpdateVote(Long ideaId, Long userId, String voteType) {
        Idea idea = ideaRepository.findById(ideaId)
            .orElseThrow(() -> new RuntimeException("Idea not found"));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Vote.VoteType type = voteType.equalsIgnoreCase("up") ? Vote.VoteType.UP : Vote.VoteType.DOWN;
        
        Optional<Vote> existingVote = voteRepository.findByIdeaIdAndUserId(ideaId, userId);
        
        if (existingVote.isPresent()) {
            Vote vote = existingVote.get();
            vote.setType(type);
            return voteRepository.save(vote);
        } else {
            Vote newVote = new Vote(idea, user, type);
            return voteRepository.save(newVote);
        }
    }
    
    public boolean deleteVote(Long ideaId, Long userId) {
        Optional<Vote> existingVote = voteRepository.findByIdeaIdAndUserId(ideaId, userId);
        
        if (existingVote.isPresent()) {
            voteRepository.delete(existingVote.get());
            return true;
        }
        
        return false;
    }
    
    public VoteStats getVoteStats(Long ideaId) {
        long upvotes = voteRepository.countUpvotesByIdeaId(ideaId);
        long downvotes = voteRepository.countDownvotesByIdeaId(ideaId);
        
        return new VoteStats(upvotes, downvotes);
    }
    
    public static class VoteStats {
        private long upvotes;
        private long downvotes;
        
        public VoteStats(long upvotes, long downvotes) {
            this.upvotes = upvotes;
            this.downvotes = downvotes;
        }
        
        public long getUpvotes() {
            return upvotes;
        }
        
        public long getDownvotes() {
            return downvotes;
        }
    }
}