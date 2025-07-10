package com.ideahub.service;

import com.ideahub.dto.IdeaDto;
import com.ideahub.entity.Idea;
import com.ideahub.entity.User;
import com.ideahub.entity.Vote;
import com.ideahub.repository.IdeaRepository;
import com.ideahub.repository.UserRepository;
import com.ideahub.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class IdeaService {
    
    @Autowired
    private IdeaRepository ideaRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private VoteRepository voteRepository;
    
    public List<IdeaDto> getAllIdeas(String sortBy, Long currentUserId) {
        List<Idea> ideas;
        
        switch (sortBy != null ? sortBy : "newest") {
            case "popular":
                ideas = ideaRepository.findAllOrderByVotesDesc();
                break;
            case "discussed":
                ideas = ideaRepository.findAllOrderByCommentsDesc();
                break;
            case "oldest":
                ideas = ideaRepository.findAll();
                break;
            default:
                ideas = ideaRepository.findAllWithDetails();
        }
        
        return ideas.stream()
            .map(idea -> {
                IdeaDto dto = new IdeaDto(idea);
                if (currentUserId != null) {
                    Optional<Vote> userVote = voteRepository.findByIdeaIdAndUserId(idea.getId(), currentUserId);
                    if (userVote.isPresent()) {
                        dto.setUserVote(userVote.get().getType() == Vote.VoteType.UP ? "up" : "down");
                    }
                }
                return dto;
            })
            .collect(Collectors.toList());
    }
    
    public Optional<IdeaDto> getIdeaById(Long id, Long currentUserId) {
        Optional<Idea> idea = ideaRepository.findByIdWithDetails(id);
        
        if (idea.isEmpty()) {
            return Optional.empty();
        }
        
        IdeaDto dto = new IdeaDto(idea.get());
        if (currentUserId != null) {
            Optional<Vote> userVote = voteRepository.findByIdeaIdAndUserId(id, currentUserId);
            if (userVote.isPresent()) {
                dto.setUserVote(userVote.get().getType() == Vote.VoteType.UP ? "up" : "down");
            }
        }
        
        return Optional.of(dto);
    }
    
    public IdeaDto createIdea(String title, String description, List<String> tags, List<String> images, Long authorId) {
        User author = userRepository.findById(authorId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Idea idea = new Idea(title, description, author);
        idea.setTags(tags);
        idea.setImages(images);
        
        Idea savedIdea = ideaRepository.save(idea);
        return new IdeaDto(savedIdea);
    }
    
    public Optional<IdeaDto> updateIdea(Long id, String title, String description, List<String> tags, List<String> images) {
        Optional<Idea> existingIdea = ideaRepository.findById(id);
        
        if (existingIdea.isEmpty()) {
            return Optional.empty();
        }
        
        Idea idea = existingIdea.get();
        idea.setTitle(title);
        idea.setDescription(description);
        idea.setTags(tags);
        idea.setImages(images);
        
        Idea updatedIdea = ideaRepository.save(idea);
        return Optional.of(new IdeaDto(updatedIdea));
    }
    
    public boolean deleteIdea(Long id) {
        if (ideaRepository.existsById(id)) {
            ideaRepository.deleteById(id);
            return true;
        }
        return false;
    }
}