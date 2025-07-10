package com.ideahub.repository;

import com.ideahub.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    
    Optional<Vote> findByIdeaIdAndUserId(Long ideaId, Long userId);
    
    @Query("SELECT COUNT(v) FROM Vote v WHERE v.idea.id = :ideaId AND v.type = 'UP'")
    long countUpvotesByIdeaId(@Param("ideaId") Long ideaId);
    
    @Query("SELECT COUNT(v) FROM Vote v WHERE v.idea.id = :ideaId AND v.type = 'DOWN'")
    long countDownvotesByIdeaId(@Param("ideaId") Long ideaId);
    
    void deleteByIdeaIdAndUserId(Long ideaId, Long userId);
}