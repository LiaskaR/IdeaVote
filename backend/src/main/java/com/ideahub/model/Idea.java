package com.ideahub.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "ideas")
@EntityListeners(AuditingEntityListener.class)
public class Idea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "image_urls", columnDefinition = "TEXT[]")
    private String[] imageUrls;
    
    @Column(name = "tags", columnDefinition = "TEXT[]")
    private String[] tags;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "idea", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Vote> votes;
    
    @OneToMany(mappedBy = "idea", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Comment> comments;
    
    // Constructors
    public Idea() {}
    
    public Idea(String title, String description, User author) {
        this.title = title;
        this.description = description;
        this.author = author;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String[] getImageUrls() { return imageUrls; }
    public void setImageUrls(String[] imageUrls) { this.imageUrls = imageUrls; }
    
    public String[] getTags() { return tags; }
    public void setTags(String[] tags) { this.tags = tags; }
    
    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public List<Vote> getVotes() { return votes; }
    public void setVotes(List<Vote> votes) { this.votes = votes; }
    
    public List<Comment> getComments() { return comments; }
    public void setComments(List<Comment> comments) { this.comments = comments; }
}