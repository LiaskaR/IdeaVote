package com.ideahub.service;

import com.ideahub.dto.CommentDto;
import com.ideahub.entity.Comment;
import com.ideahub.entity.Idea;
import com.ideahub.entity.User;
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
    
    public List<CommentDto> getCommentsByIdeaId(Long ideaId) {
        List<Comment> comments = commentRepository.findByIdeaIdWithAuthor(ideaId);
        
        return comments.stream()
            .map(CommentDto::new)
            .collect(Collectors.toList());
    }
    
    public CommentDto createComment(Long ideaId, Long userId, String content) {
        Idea idea = ideaRepository.findById(ideaId)
            .orElseThrow(() -> new RuntimeException("Idea not found"));
        
        User author = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Comment comment = new Comment(idea, author, content);
        Comment savedComment = commentRepository.save(comment);
        
        return new CommentDto(savedComment);
    }
    
    public boolean deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
            .orElse(null);
        
        if (comment == null) {
            return false;
        }
        
        // Only allow author to delete their own comments
        if (!comment.getAuthor().getId().equals(userId)) {
            return false;
        }
        
        commentRepository.delete(comment);
        return true;
    }
}