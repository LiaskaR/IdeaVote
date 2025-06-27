package com.ideahub.repository;

import com.ideahub.model.Idea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IdeaRepository extends JpaRepository<Idea, Long> {
    
    @Query("SELECT i FROM Idea i LEFT JOIN FETCH i.author LEFT JOIN FETCH i.votes LEFT JOIN FETCH i.comments ORDER BY i.createdAt DESC")
    List<Idea> findAllWithDetails();
    
    @Query("SELECT i FROM Idea i LEFT JOIN FETCH i.author LEFT JOIN FETCH i.votes LEFT JOIN FETCH i.comments WHERE i.id = :id")
    Idea findByIdWithDetails(@Param("id") Long id);
    
    @Query("SELECT i FROM Idea i LEFT JOIN FETCH i.author LEFT JOIN FETCH i.votes LEFT JOIN FETCH i.comments ORDER BY SIZE(i.votes) DESC")
    List<Idea> findAllByVotesDesc();
    
    @Query("SELECT i FROM Idea i LEFT JOIN FETCH i.author LEFT JOIN FETCH i.votes LEFT JOIN FETCH i.comments ORDER BY SIZE(i.comments) DESC")
    List<Idea> findAllByCommentsDesc();
    
    List<Idea> findByAuthorIdOrderByCreatedAtDesc(String authorId);
}