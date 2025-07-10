package com.ideahub.repository;

import com.ideahub.entity.Idea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IdeaRepository extends JpaRepository<Idea, Long> {
    
    @Query("SELECT i FROM Idea i JOIN FETCH i.author LEFT JOIN FETCH i.votes LEFT JOIN FETCH i.comments ORDER BY i.createdAt DESC")
    List<Idea> findAllWithDetails();
    
    @Query("SELECT i FROM Idea i JOIN FETCH i.author LEFT JOIN FETCH i.votes LEFT JOIN FETCH i.comments " +
           "WHERE i.id = :id")
    Optional<Idea> findByIdWithDetails(@Param("id") Long id);
    
    @Query("SELECT i FROM Idea i JOIN FETCH i.author LEFT JOIN FETCH i.votes LEFT JOIN FETCH i.comments " +
           "ORDER BY SIZE(i.votes) DESC")
    List<Idea> findAllOrderByVotesDesc();
    
    @Query("SELECT i FROM Idea i JOIN FETCH i.author LEFT JOIN FETCH i.votes LEFT JOIN FETCH i.comments " +
           "ORDER BY SIZE(i.comments) DESC")
    List<Idea> findAllOrderByCommentsDesc();
    
    List<Idea> findByAuthorIdOrderByCreatedAtDesc(Long authorId);
}