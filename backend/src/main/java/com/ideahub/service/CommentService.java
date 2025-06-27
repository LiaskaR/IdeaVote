package com.ideahub.service;

import com.ideahub.dto.CommentDTO;
import com.ideahub.dto.UserDTO;
import com.ideahub.model.Comment;
import com.ideahub.model.Idea;
import com.ideahub.model.User;
import com.ideahub.repository.CommentRepository;
import com.ideahub.repository.IdeaRepository;
import com.ideahub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CommentService {
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private IdeaRepository ideaRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserService userService;
    
    public List<CommentDTO> getCommentsByIdeaId(Long ideaId) {
        List<Comment> comments = commentRepository.findByIdeaIdWithAuthor(ideaId);
        return comments.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public CommentDTO createComment(Long ideaId, CommentDTO commentDTO) {
        UserDTO currentUser = userService.getCurrentUser();
        
        Idea idea = ideaRepository.findById(ideaId)
            .orElseThrow(() -> new RuntimeException("Idea not found"));
        
        User author = userRepository.findById(currentUser.getId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Comment comment = new Comment(idea, author, commentDTO.getContent());
        comment = commentRepository.save(comment);
        
        return convertToDTO(comment);
    }
    
    public boolean deleteComment(Long commentId) {
        UserDTO currentUser = userService.getCurrentUser();
        
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        // Check if user is the author
        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Not authorized to delete this comment");
        }
        
        commentRepository.delete(comment);
        return true;
    }
    
    private CommentDTO convertToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setIdeaId(comment.getIdea().getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        
        // Convert author
        UserDTO authorDTO = new UserDTO();
        authorDTO.setId(comment.getAuthor().getId());
        authorDTO.setUsername(comment.getAuthor().getUsername());
        authorDTO.setEmail(comment.getAuthor().getEmail());
        authorDTO.setFirstName(comment.getAuthor().getFirstName());
        authorDTO.setLastName(comment.getAuthor().getLastName());
        authorDTO.setProfileImageUrl(comment.getAuthor().getProfileImageUrl());
        dto.setAuthor(authorDTO);
        
        return dto;
    }
}