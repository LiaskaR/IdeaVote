package com.ideahub.repository;

import com.ideahub.model.Vote;
import com.ideahub.model.Vote.VoteType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    Optional<Vote> findByIdeaIdAndUserId(Long ideaId, String userId);
    
    @Query("SELECT COUNT(v) FROM Vote v WHERE v.idea.id = :ideaId AND v.type = :type")
    long countByIdeaIdAndType(@Param("ideaId") Long ideaId, @Param("type") VoteType type);
    
    @Query("SELECT COUNT(v) FROM Vote v")
    long countTotalVotes();
    
    void deleteByIdeaIdAndUserId(Long ideaId, String userId);
}