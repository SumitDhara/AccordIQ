package com.accordiq.document.repository;

import com.accordiq.document.entity.Document;
import com.accordiq.document.enums.DocumentStatus;
import com.accordiq.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface DocumentRepository
        extends JpaRepository<Document, UUID> {

    List<Document>
    findAllByOwnerOrderByCreatedAtDesc(
            User owner
    );

    List<Document>
    findByOwnerAndOriginalFileNameContainingIgnoreCaseOrderByCreatedAtDesc(
            User owner,
            String keyword
    );

    List<Document>
    findByOwnerAndStatusOrderByCreatedAtDesc(
            User owner,
            DocumentStatus status
    );

    List<Document>
    findByOwnerAndOriginalFileNameContainingIgnoreCaseAndStatusOrderByCreatedAtDesc(
            User owner,
            String keyword,
            DocumentStatus status
    );

    java.util.Optional<Document>
    findByIdAndOwner(
            UUID id,
            User owner
    );

    /*
     * Dashboard Analytics
     */

    long countByOwner(
            User owner
    );

    long countByOwnerAndStatus(
            User owner,
            DocumentStatus status
    );

    long countByOwnerAndCreatedAtGreaterThanEqual(
            User owner,
            LocalDateTime start
    );

    /*
     * Dashboard Recent Documents
     */

    List<Document>
    findTop10ByOwnerOrderByCreatedAtDesc(
            User owner
    );
}