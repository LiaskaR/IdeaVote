package com.ideahub.dto;

public class StatsDTO {
    private long totalIdeas;
    private long totalVotes;
    private long activeUsers;
    
    // Constructors
    public StatsDTO() {}
    
    public StatsDTO(long totalIdeas, long totalVotes, long activeUsers) {
        this.totalIdeas = totalIdeas;
        this.totalVotes = totalVotes;
        this.activeUsers = activeUsers;
    }
    
    // Getters and Setters
    public long getTotalIdeas() { return totalIdeas; }
    public void setTotalIdeas(long totalIdeas) { this.totalIdeas = totalIdeas; }
    
    public long getTotalVotes() { return totalVotes; }
    public void setTotalVotes(long totalVotes) { this.totalVotes = totalVotes; }
    
    public long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }
}