package com.accordiq.review.service;

import com.accordiq.common.exception.ResourceNotFoundException;
import com.accordiq.document.entity.Document;
import com.accordiq.document.enums.DocumentStatus;
import com.accordiq.document.repository.DocumentRepository;
import com.accordiq.review.dto.request.ReviewRequest;
import com.accordiq.review.dto.response.ReviewResponse;
import com.accordiq.review.entity.DocumentReview;
import com.accordiq.review.enums.ReviewStatus;
import com.accordiq.review.repository.DocumentReviewRepository;
import com.accordiq.security.util.CurrentUserService;
import com.accordiq.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class DocumentReviewServiceImpl
        implements DocumentReviewService {

    private final DocumentReviewRepository reviewRepository;
    private final DocumentRepository documentRepository;
    private final CurrentUserService currentUserService;

    public DocumentReviewServiceImpl(
            DocumentReviewRepository reviewRepository,
            DocumentRepository documentRepository,
            CurrentUserService currentUserService
    ) {
        this.reviewRepository = reviewRepository;
        this.documentRepository = documentRepository;
        this.currentUserService = currentUserService;
    }

    @Override
    public ReviewResponse approve(
            UUID documentId,
            ReviewRequest request
    ) {

        DocumentReview review = getOrCreate(documentId);

        review.setStatus(ReviewStatus.APPROVED);

        review.setReviewerComments(
                request.comments()
        );

        review.getDocument().setStatus(
                DocumentStatus.COMPLETED
        );

        reviewRepository.save(review);

        return map(review);
    }

    @Override
    public ReviewResponse reject(
            UUID documentId,
            ReviewRequest request
    ) {

        DocumentReview review = getOrCreate(documentId);

        review.setStatus(ReviewStatus.REJECTED);

        review.setReviewerComments(
                request.comments()
        );

        review.getDocument().setStatus(
                DocumentStatus.REVIEW_REQUIRED
        );

        reviewRepository.save(review);

        return map(review);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getReview(
            UUID documentId
    ) {

        Document document =
                getOwnedDocument(documentId);

        DocumentReview review =
                reviewRepository
                        .findByDocumentId(document.getId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Review not found for document: "
                                                + documentId
                                )
                        );

        return map(review);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getPendingReviews() {

        User currentUser =
                currentUserService.getCurrentUser();

        return reviewRepository
                .findByStatusAndDocumentOwnerOrderByCreatedAtAsc(
                        ReviewStatus.PENDING,
                        currentUser
                )
                .stream()
                .map(this::map)
                .toList();
    }

    private DocumentReview getOrCreate(
            UUID documentId
    ) {

        Document document =
                getOwnedDocument(documentId);

        return reviewRepository
                .findByDocumentId(document.getId())
                .orElseGet(() -> {

                    DocumentReview review =
                            DocumentReview.builder()
                                    .document(document)
                                    .status(
                                            ReviewStatus.PENDING
                                    )
                                    .build();

                    return reviewRepository.save(review);
                });
    }

    private Document getOwnedDocument(
            UUID documentId
    ) {

        User currentUser =
                currentUserService.getCurrentUser();

        return documentRepository
                .findByIdAndOwner(
                        documentId,
                        currentUser
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Document not found with id: "
                                        + documentId
                        )
                );
    }

    private ReviewResponse map(
            DocumentReview review
    ) {

        return new ReviewResponse(
                review.getId(),
                review.getDocument().getId(),
                review.getStatus(),
                review.getReviewerComments()
        );
    }
}