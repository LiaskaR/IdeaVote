package com.ideahub.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "votes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"idea_id", "user_id"})
})
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
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VoteType type;
    
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
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Idea getIdea() {
        return idea;
    }
    
    public void setIdea(Idea idea) {
        this.idea = idea;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public VoteType getType() {
        return type;
    }
    
    public void setType(VoteType type) {
        this.type = type;
    }
}