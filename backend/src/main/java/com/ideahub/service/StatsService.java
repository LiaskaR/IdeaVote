package com.ideahub.service;

import com.ideahub.dto.StatsDTO;
import com.ideahub.repository.IdeaRepository;
import com.ideahub.repository.UserRepository;
import com.ideahub.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StatsService {
    
    @Autowired
    private IdeaRepository ideaRepository;
    
    @Autowired
    private VoteRepository voteRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public StatsDTO getStats() {
        long totalIdeas = ideaRepository.count();
        long totalVotes = voteRepository.countTotalVotes();
        long activeUsers = userRepository.countActiveUsers();
        
        return new StatsDTO(totalIdeas, totalVotes, activeUsers);
    }
}