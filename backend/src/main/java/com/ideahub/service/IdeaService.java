package com.ideahub.service;

import com.ideahub.dto.IdeaDTO;
import com.ideahub.dto.UserDTO;
import com.ideahub.model.Idea;
import com.ideahub.model.User;
import com.ideahub.model.Vote;
import com.ideahub.repository.IdeaRepository;
import com.ideahub.repository.UserRepository;
import com.ideahub.repository.VoteRepository;
import org.keycloak.KeycloakPrincipal;
import org.keycloak.KeycloakSecurityContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    
    @Autowired
    private UserService userService;
    
    public List<IdeaDTO> getAllIdeas(String sortBy) {
        List<Idea> ideas;
        
        switch (sortBy != null ? sortBy : "newest") {
            case "votes":
                ideas = ideaRepository.findAllByVotesDesc();
                break;
            case "comments":
                ideas = ideaRepository.findAllByCommentsDesc();
                break;
            default:
                ideas = ideaRepository.findAllWithDetails();
                break;
        }
        
        return ideas.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public IdeaDTO getIdeaById(Long id) {
        Idea idea = ideaRepository.findByIdWithDetails(id);
        return idea != null ? convertToDTO(idea) : null;
    }
    
    public IdeaDTO createIdea(IdeaDTO ideaDTO) {
        UserDTO currentUser = userService.getCurrentUser();
        User author = userRepository.findById(currentUser.getId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Idea idea = new Idea();
        idea.setTitle(ideaDTO.getTitle());
        idea.setDescription(ideaDTO.getDescription());
        idea.setImageUrls(ideaDTO.getImageUrls());
        idea.setTags(ideaDTO.getTags());
        idea.setAuthor(author);
        
        idea = ideaRepository.save(idea);
        return convertToDTO(idea);
    }
    
    public IdeaDTO updateIdea(Long id, IdeaDTO ideaDTO) {
        UserDTO currentUser = userService.getCurrentUser();
        Idea idea = ideaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Idea not found"));
        
        // Check if user is the author
        if (!idea.getAuthor().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Not authorized to update this idea");
        }
        
        idea.setTitle(ideaDTO.getTitle());
        idea.setDescription(ideaDTO.getDescription());
        idea.setImageUrls(ideaDTO.getImageUrls());
        idea.setTags(ideaDTO.getTags());
        
        idea = ideaRepository.save(idea);
        return convertToDTO(idea);
    }
    
    public boolean deleteIdea(Long id) {
        UserDTO currentUser = userService.getCurrentUser();
        Idea idea = ideaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Idea not found"));
        
        // Check if user is the author
        if (!idea.getAuthor().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Not authorized to delete this idea");
        }
        
        ideaRepository.delete(idea);
        return true;
    }
    
    private IdeaDTO convertToDTO(Idea idea) {
        IdeaDTO dto = new IdeaDTO();
        dto.setId(idea.getId());
        dto.setTitle(idea.getTitle());
        dto.setDescription(idea.getDescription());
        dto.setImageUrls(idea.getImageUrls());
        dto.setTags(idea.getTags());
        dto.setCreatedAt(idea.getCreatedAt());
        dto.setUpdatedAt(idea.getUpdatedAt());
        
        // Convert author
        UserDTO authorDTO = new UserDTO();
        authorDTO.setId(idea.getAuthor().getId());
        authorDTO.setUsername(idea.getAuthor().getUsername());
        authorDTO.setEmail(idea.getAuthor().getEmail());
        authorDTO.setFirstName(idea.getAuthor().getFirstName());
        authorDTO.setLastName(idea.getAuthor().getLastName());
        authorDTO.setProfileImageUrl(idea.getAuthor().getProfileImageUrl());
        dto.setAuthor(authorDTO);
        
        // Count votes
        long upvotes = voteRepository.countByIdeaIdAndType(idea.getId(), Vote.VoteType.UP);
        long downvotes = voteRepository.countByIdeaIdAndType(idea.getId(), Vote.VoteType.DOWN);
        dto.setUpvotes(upvotes);
        dto.setDownvotes(downvotes);
        
        // Count comments
        dto.setCommentCount((long) idea.getComments().size());
        
        // Check user vote if authenticated
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof KeycloakPrincipal) {
            try {
                UserDTO currentUser = userService.getCurrentUser();
                Optional<Vote> userVote = voteRepository.findByIdeaIdAndUserId(idea.getId(), currentUser.getId());
                if (userVote.isPresent()) {
                    dto.setUserVote(userVote.get().getType() == Vote.VoteType.UP ? "up" : "down");
                }
            } catch (Exception e) {
                // User not authenticated or error getting user
                dto.setUserVote(null);
            }
        }
        
        return dto;
    }
}