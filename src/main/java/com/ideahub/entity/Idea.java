package com.ideahub.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "ideas")
@EntityListeners(AuditingEntityListener.class)
public class Idea {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Size(min = 5, max = 200)
    @Column(nullable = false)
    private String title;
    
    @NotBlank
    @Size(min = 10, max = 5000)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @ElementCollection
    @CollectionTable(name = "idea_tags", joinColumns = @JoinColumn(name = "idea_id"))
    @Column(name = "tag")
    private List<String> tags;
    
    @ElementCollection
    @CollectionTable(name = "idea_images", joinColumns = @JoinColumn(name = "idea_id"))
    @Column(name = "image_url")
    private List<String> images;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "idea", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Vote> votes;
    
    @OneToMany(mappedBy = "idea", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Comment> comments;
    
    // Constructors
    public Idea() {}
    
    public Idea(String title, String description, User author) {
        this.title = title;
        this.description = description;
        this.author = author;
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
    
    public User getAuthor() {
        return author;
    }
    
    public void setAuthor(User author) {
        this.author = author;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public Set<Vote> getVotes() {
        return votes;
    }
    
    public void setVotes(Set<Vote> votes) {
        this.votes = votes;
    }
    
    public Set<Comment> getComments() {
        return comments;
    }
    
    public void setComments(Set<Comment> comments) {
        this.comments = comments;
    }
}