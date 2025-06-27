package com.ideahub.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "votes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"idea_id", "user_id"})
})
@EntityListeners(AuditingEntityListener.class)
public class Vote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idea_id", nullable = false)
    private Idea idea;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VoteType type;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    public enum VoteType {
        UP, DOWN
    }
    
    // Constructors
    public Vote() {}
    
    public Vote(Idea idea, User user, VoteType type) {
        this.idea = idea;
        this.user = user;
        this.type = type;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Idea getIdea() { return idea; }
    public void setIdea(Idea idea) { this.idea = idea; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public VoteType getType() { return type; }
    public void setType(VoteType type) { this.type = type; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}