package com.ideahub.repository;

import com.ideahub.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    @Query("SELECT c FROM Comment c JOIN FETCH c.author WHERE c.idea.id = :ideaId ORDER BY c.createdAt ASC")
    List<Comment> findByIdeaIdWithAuthor(@Param("ideaId") Long ideaId);
    
    long countByIdeaId(Long ideaId);
    
    List<Comment> findByAuthorIdOrderByCreatedAtDesc(Long authorId);
}