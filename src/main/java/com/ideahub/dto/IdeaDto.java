package com.ideahub.dto;

import com.ideahub.entity.Idea;
import com.ideahub.entity.Vote;

import java.time.LocalDateTime;
import java.util.List;

public class IdeaDto {
    private Long id;
    private String title;
    private String description;
    private List<String> tags;
    private List<String> images;
    private UserDto author;
    private LocalDateTime createdAt;
    private long upvotes;
    private long downvotes;
    private long commentCount;
    private String userVote; // "up", "down", or null
    
    public IdeaDto() {}
    
    public IdeaDto(Idea idea) {
        this.id = idea.getId();
        this.title = idea.getTitle();
        this.description = idea.getDescription();
        this.tags = idea.getTags();
        this.images = idea.getImages();
        this.author = new UserDto(idea.getAuthor());
        this.createdAt = idea.getCreatedAt();
        
        // Calculate vote counts
        if (idea.getVotes() != null) {
            this.upvotes = idea.getVotes().stream()
                .filter(vote -> vote.getType() == Vote.VoteType.UP)
                .count();
            this.downvotes = idea.getVotes().stream()
                .filter(vote -> vote.getType() == Vote.VoteType.DOWN)
                .count();
        }
        
        // Calculate comment count
        this.commentCount = idea.getComments() != null ? idea.getComments().size() : 0;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public List<String> getTags() {
        return tags;
    }
    
    public void setTags(List<String> tags) {
        this.tags = tags;
    }
    
    public List<String> getImages() {
        return images;
    }
    
    public void setImages(List<String> images) {
        this.images = images;
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
    
    public long getUpvotes() {
        return upvotes;
    }
    
    public void setUpvotes(long upvotes) {
        this.upvotes = upvotes;
    }
    
    public long getDownvotes() {
        return downvotes;
    }
    
    public void setDownvotes(long downvotes) {
        this.downvotes = downvotes;
    }
    
    public long getCommentCount() {
        return commentCount;
    }
    
    public void setCommentCount(long commentCount) {
        this.commentCount = commentCount;
    }
    
    public String getUserVote() {
        return userVote;
    }
    
    public void setUserVote(String userVote) {
        this.userVote = userVote;
    }
}