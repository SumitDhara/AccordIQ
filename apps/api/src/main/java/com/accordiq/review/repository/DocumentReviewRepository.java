package com.accordiq.review.repository;

import com.accordiq.review.entity.DocumentReview;
import com.accordiq.review.enums.ReviewStatus;
import com.accordiq.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentReviewRepository
        extends JpaRepository<DocumentReview, UUID> {

    Optional<DocumentReview> findByDocumentId(
            UUID documentId
    );

    List<DocumentReview> findByStatusAndDocumentOwnerOrderByCreatedAtAsc(
            ReviewStatus status,
            User owner
    );
}