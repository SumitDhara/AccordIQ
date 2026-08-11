package com.accordiq.dashboard.service;

import com.accordiq.dashboard.dto.response.DashboardStatsResponse;
import com.accordiq.dashboard.dto.response.RecentDocumentResponse;
import com.accordiq.document.entity.Document;
import com.accordiq.document.enums.DocumentStatus;
import com.accordiq.document.repository.DocumentRepository;
import com.accordiq.security.util.CurrentUserService;
import com.accordiq.user.entity.User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DashboardServiceImpl
        implements DashboardService {

    private final DocumentRepository documentRepository;
    private final CurrentUserService currentUserService;

    public DashboardServiceImpl(
            DocumentRepository documentRepository,
            CurrentUserService currentUserService
    ) {
        this.documentRepository = documentRepository;
        this.currentUserService = currentUserService;
    }

    @Override
    public DashboardStatsResponse getStatistics() {

        User currentUser =
                currentUserService.getCurrentUser();

        long totalDocuments =
                documentRepository.countByOwner(
                        currentUser
                );

        long uploadedToday =
                documentRepository
                        .countByOwnerAndCreatedAtGreaterThanEqual(
                                currentUser,
                                LocalDateTime.now()
                                        .toLocalDate()
                                        .atStartOfDay()
                        );

        long processing =
                documentRepository.countByOwnerAndStatus(
                        currentUser,
                        DocumentStatus.PROCESSING
                );

        long completed =
                documentRepository.countByOwnerAndStatus(
                        currentUser,
                        DocumentStatus.COMPLETED
                );

        long reviewRequired =
                documentRepository.countByOwnerAndStatus(
                        currentUser,
                        DocumentStatus.REVIEW_REQUIRED
                );

        long failed =
                documentRepository.countByOwnerAndStatus(
                        currentUser,
                        DocumentStatus.FAILED
                );

        return new DashboardStatsResponse(
                totalDocuments,
                uploadedToday,
                processing,
                completed,
                reviewRequired,
                failed
        );
    }

    @Override
    public List<RecentDocumentResponse> getRecentDocuments() {

        User currentUser =
                currentUserService.getCurrentUser();

        return documentRepository
                .findTop10ByOwnerOrderByCreatedAtDesc(
                        currentUser
                )
                .stream()
                .map(this::mapRecentDocument)
                .toList();
    }

    private RecentDocumentResponse mapRecentDocument(
            Document document
    ) {

        return new RecentDocumentResponse(
                document.getId(),
                document.getOriginalFileName(),
                document.getStatus(),
                document.getFileSize(),
                document.getCreatedAt()
        );
    }
}