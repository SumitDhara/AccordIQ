package com.accordiq.document.service.impl;

import com.accordiq.ai.dto.response.DocumentAnalysisResponse;
import com.accordiq.common.exception.ResourceNotFoundException;
import com.accordiq.document.dto.request.DocumentSearchRequest;
import com.accordiq.document.dto.response.DocumentResponse;
import com.accordiq.document.dto.response.UploadAnalysisResponse;
import com.accordiq.document.dto.response.UploadDocumentResponse;
import com.accordiq.document.entity.Document;
import com.accordiq.document.enums.DocumentStatus;
import com.accordiq.document.processing.DocumentProcessingService;
import com.accordiq.document.repository.DocumentRepository;
import com.accordiq.document.service.DocumentService;
import com.accordiq.documentanalysis.entity.DocumentAnalysis;
import com.accordiq.documentanalysis.repository.DocumentAnalysisRepository;
import com.accordiq.documentfield.entity.DocumentField;
import com.accordiq.documentfield.repository.DocumentFieldRepository;
import com.accordiq.security.util.CurrentUserService;
import com.accordiq.storage.service.FileStorageService;
import com.accordiq.user.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentServiceImpl implements DocumentService {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(DocumentServiceImpl.class);

    private final DocumentRepository documentRepository;
    private final FileStorageService fileStorageService;
    private final DocumentProcessingService documentProcessingService;
    private final CurrentUserService currentUserService;
    private final DocumentAnalysisRepository documentAnalysisRepository;
    private final DocumentFieldRepository documentFieldRepository;

    public DocumentServiceImpl(
            DocumentRepository documentRepository,
            FileStorageService fileStorageService,
            DocumentProcessingService documentProcessingService,
            CurrentUserService currentUserService,
            DocumentAnalysisRepository documentAnalysisRepository,
            DocumentFieldRepository documentFieldRepository
    ) {
        this.documentRepository = documentRepository;
        this.fileStorageService = fileStorageService;
        this.documentProcessingService = documentProcessingService;
        this.currentUserService = currentUserService;
        this.documentAnalysisRepository =
                documentAnalysisRepository;
        this.documentFieldRepository =
                documentFieldRepository;
    }

    @Override
    public UploadAnalysisResponse upload(
            MultipartFile file
    ) throws IOException {

        /*
         * Analysis is intentionally available to both
         * anonymous and authenticated users.
         *
         * Anonymous users receive the analysis result but
         * their generated database records are removed after
         * processing.
         *
         * Authenticated users retain the document and its
         * structured analysis.
         */
        User currentUser =
                currentUserService.getCurrentUserOrNull();

        boolean anonymous =
                currentUser == null;

        String storedFileName =
                fileStorageService.store(file);

        Document savedDocument = null;

        try {

            Document document =
                    Document.builder()
                            .originalFileName(
                                    file.getOriginalFilename()
                            )
                            .storedFileName(
                                    storedFileName
                            )
                            .contentType(
                                    file.getContentType()
                            )
                            .fileSize(
                                    file.getSize()
                            )
                            .storagePath(
                                    fileStorageService
                                            .getStorageLocation()
                                            .resolve(storedFileName)
                                            .toString()
                            )
                            .owner(currentUser)
                            .build();

            savedDocument =
                    documentRepository.save(document);

            try {

                DocumentAnalysisResponse analysis =
                        documentProcessingService.process(
                                savedDocument
                        );

                UploadDocumentResponse upload =
                        new UploadDocumentResponse(
                                savedDocument.getId(),
                                savedDocument.getOriginalFileName(),
                                savedDocument.getStoredFileName(),
                                savedDocument.getContentType(),
                                savedDocument.getFileSize(),
                                savedDocument.getStatus().name()
                        );

                return new UploadAnalysisResponse(
                        upload,
                        analysis
                );

            } catch (RuntimeException exception) {

                savedDocument.setStatus(
                        DocumentStatus.FAILED
                );

                documentRepository.save(
                        savedDocument
                );

                throw exception;
            }

        } finally {

            /*
             * Anonymous analyses are temporary.
             *
             * Delete database records created during processing
             * before removing the physical upload.
             */
            if (anonymous && savedDocument != null) {

                cleanupAnonymousDocument(
                        savedDocument.getId()
                );
            }

            /*
             * Uploaded files are temporary processing artifacts.
             *
             * They are removed whether processing succeeds
             * or fails.
             */
            try {

                fileStorageService.delete(
                        storedFileName
                );

                LOGGER.info(
                        "Temporary uploaded file removed: {}",
                        storedFileName
                );

            } catch (IOException cleanupException) {

                LOGGER.warn(
                        "Failed to remove temporary uploaded file: {}",
                        storedFileName,
                        cleanupException
                );
            }
        }
    }

    /**
     * Removes all persistent records generated for an
     * anonymous analysis.
     *
     * Deletion order is important because DocumentField
     * references DocumentAnalysis and DocumentAnalysis
     * references Document.
     */
    private void cleanupAnonymousDocument(
            UUID documentId
    ) {

        try {

            DocumentAnalysis analysis =
                    documentAnalysisRepository
                            .findByDocumentId(documentId)
                            .orElse(null);

            if (analysis != null) {

                List<DocumentField> fields =
                        documentFieldRepository
                                .findByAnalysisId(
                                        analysis.getId()
                                );

                if (!fields.isEmpty()) {

                    documentFieldRepository.deleteAll(
                            fields
                    );
                }

                documentAnalysisRepository.delete(
                        analysis
                );
            }

            documentRepository.deleteById(
                    documentId
            );

            LOGGER.info(
                    "Anonymous analysis records removed for document: {}",
                    documentId
            );

        } catch (RuntimeException exception) {

            /*
             * The analysis result has already been produced.
             * Log cleanup failure rather than hiding the
             * successful analysis response from the user.
             */
            LOGGER.error(
                    "Failed to clean up anonymous analysis records for document: {}",
                    documentId,
                    exception
            );
        }
    }

    @Override
    public List<DocumentResponse> getAllDocuments() {

        User currentUser =
                currentUserService.getCurrentUser();

        return documentRepository
                .findAllByOwnerOrderByCreatedAtDesc(
                        currentUser
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public DocumentResponse getDocumentById(
            UUID id
    ) {

        User currentUser =
                currentUserService.getCurrentUser();

        Document document =
                documentRepository
                        .findByIdAndOwner(
                                id,
                                currentUser
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Document not found with id: "
                                                + id
                                )
                        );

        return mapToResponse(document);
    }

    @Override
    public void deleteDocument(
            UUID id
    ) {

        User currentUser =
                currentUserService.getCurrentUser();

        Document document =
                documentRepository
                        .findByIdAndOwner(
                                id,
                                currentUser
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Document not found with id: "
                                                + id
                                )
                        );

        try {

            /*
             * Storage concerns remain inside
             * FileStorageService.
             *
             * The file may already have been removed after
             * processing, so delete() safely handles a
             * missing file.
             */
            fileStorageService.delete(
                    document.getStoredFileName()
            );

        } catch (IOException exception) {

            throw new RuntimeException(
                    "Failed to delete document from storage.",
                    exception
            );
        }

        documentRepository.delete(document);
    }

    @Override
    public List<DocumentResponse> searchDocuments(
            String keyword,
            DocumentStatus status
    ) {

        User currentUser =
                currentUserService.getCurrentUser();

        keyword =
                keyword == null
                        ? null
                        : keyword.trim();

        List<Document> documents;

        boolean hasKeyword =
                keyword != null && !keyword.isBlank();

        boolean hasStatus =
                status != null;

        if (hasKeyword && hasStatus) {

            documents =
                    documentRepository
                            .findByOwnerAndOriginalFileNameContainingIgnoreCaseAndStatusOrderByCreatedAtDesc(
                                    currentUser,
                                    keyword,
                                    status
                            );

        } else if (hasKeyword) {

            documents =
                    documentRepository
                            .findByOwnerAndOriginalFileNameContainingIgnoreCaseOrderByCreatedAtDesc(
                                    currentUser,
                                    keyword
                            );

        } else if (hasStatus) {

            documents =
                    documentRepository
                            .findByOwnerAndStatusOrderByCreatedAtDesc(
                                    currentUser,
                                    status
                            );

        } else {

            documents =
                    documentRepository
                            .findAllByOwnerOrderByCreatedAtDesc(
                                    currentUser
                            );
        }

        return documents
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<DocumentResponse> advancedSearch(
            DocumentSearchRequest request
    ) {

        return searchDocuments(
                request.keyword(),
                request.status()
        );
    }

    private DocumentResponse mapToResponse(
            Document document
    ) {

        return new DocumentResponse(
                document.getId(),
                document.getOriginalFileName(),
                document.getContentType(),
                document.getFileSize(),
                document.getStatus()
        );
    }
}