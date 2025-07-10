package com.ideahub.dto;

import com.ideahub.entity.Comment;

import java.time.LocalDateTime;

public class CommentDto {
    private Long id;
    private String content;
    private UserDto author;
    private LocalDateTime createdAt;
    
    public CommentDto() {}
    
    public CommentDto(Comment comment) {
        this.id = comment.getId();
        this.content = comment.getContent();
        this.author = new UserDto(comment.getAuthor());
        this.createdAt = comment.getCreatedAt();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public UserDto getAuthor() {
        return author;
    }
    
    public void setAuthor(UserDto author) {
        this.author = author;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}