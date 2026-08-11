package com.accordiq.document.service.impl;

import com.accordiq.common.exception.ResourceNotFoundException;
import com.accordiq.document.dto.response.DocumentDetailsResponse;
import com.accordiq.document.dto.response.DocumentFieldResponse;
import com.accordiq.document.entity.Document;
import com.accordiq.document.repository.DocumentRepository;
import com.accordiq.document.service.DocumentDetailsService;
import com.accordiq.documentanalysis.entity.DocumentAnalysis;
import com.accordiq.documentanalysis.repository.DocumentAnalysisRepository;
import com.accordiq.documentfield.entity.DocumentField;
import com.accordiq.documentfield.repository.DocumentFieldRepository;
import com.accordiq.security.util.CurrentUserService;
import com.accordiq.user.entity.User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class DocumentDetailsServiceImpl
        implements DocumentDetailsService {

    private final DocumentRepository documentRepository;
    private final DocumentAnalysisRepository analysisRepository;
    private final DocumentFieldRepository fieldRepository;
    private final CurrentUserService currentUserService;

    public DocumentDetailsServiceImpl(
            DocumentRepository documentRepository,
            DocumentAnalysisRepository analysisRepository,
            DocumentFieldRepository fieldRepository,
            CurrentUserService currentUserService
    ) {
        this.documentRepository = documentRepository;
        this.analysisRepository = analysisRepository;
        this.fieldRepository = fieldRepository;
        this.currentUserService = currentUserService;
    }

    @Override
    public DocumentDetailsResponse getDocumentDetails(
            UUID documentId
    ) {

        User currentUser =
                currentUserService.getCurrentUser();

        Document document =
                documentRepository
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

        DocumentAnalysis analysis =
                analysisRepository.findByDocumentId(
                                documentId
                        )
                        .orElse(null);

        List<DocumentFieldResponse> fields =
                List.of();

        String summary = null;
        String documentType = null;

        if (analysis != null) {

            summary = analysis.getSummary();
            documentType = analysis.getDocumentType();

            fields =
                    fieldRepository
                            .findByAnalysisId(
                                    analysis.getId()
                            )
                            .stream()
                            .map(this::mapField)
                            .toList();
        }

        return new DocumentDetailsResponse(
                document.getId(),
                document.getOriginalFileName(),
                document.getContentType(),
                document.getFileSize(),
                document.getStatus(),
                documentType,
                summary,
                fields
        );
    }

    private DocumentFieldResponse mapField(
            DocumentField field
    ) {

        return new DocumentFieldResponse(
                field.getFieldName(),
                field.getFieldValue(),
                field.getConfidence()
        );
    }
}