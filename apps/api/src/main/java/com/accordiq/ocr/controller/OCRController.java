package com.accordiq.ocr.controller;

import com.accordiq.common.response.ApiResponse;
import com.accordiq.ocr.model.OCRResult;
import com.accordiq.ocr.service.OCRService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/v1/ocr")
@RequiredArgsConstructor
public class OCRController {

    private final OCRService ocrService;

    @PostMapping(
            value = "/extract",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<OCRResult>> extractText(
            @RequestParam("file") MultipartFile file
    ) {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(
                            false,
                            "Please provide a file.",
                            null
                    )
            );
        }

        String contentType = file.getContentType();

        if (!isSupported(contentType)) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(
                            false,
                            "Only PDF, PNG and JPG files are supported.",
                            null
                    )
            );
        }

        Path temporaryFile = null;

        try {
            String originalName = file.getOriginalFilename();

            String extension = getExtension(
                    originalName,
                    contentType
            );

            temporaryFile = Files.createTempFile(
                    "accordiq-ocr-",
                    extension
            );

            file.transferTo(temporaryFile);

            OCRResult result =
                    ocrService.extractText(temporaryFile);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "OCR completed successfully.",
                            result
                    )
            );

        } catch (IOException ex) {

            return ResponseEntity.internalServerError().body(
                    new ApiResponse<>(
                            false,
                            "Failed to process the uploaded file.",
                            null
                    )
            );

        } finally {

            if (temporaryFile != null) {
                try {
                    Files.deleteIfExists(
                            temporaryFile
                    );
                } catch (IOException ignored) {
                    // Temporary-file cleanup failure should
                    // not change an otherwise successful response.
                }
            }
        }
    }

    private boolean isSupported(String contentType) {

        return "application/pdf".equalsIgnoreCase(contentType)
                || "image/png".equalsIgnoreCase(contentType)
                || "image/jpeg".equalsIgnoreCase(contentType)
                || "image/jpg".equalsIgnoreCase(contentType);
    }

    private String getExtension(
            String originalName,
            String contentType
    ) {

        if (originalName != null) {

            int index =
                    originalName.lastIndexOf('.');

            if (index >= 0) {
                return originalName.substring(index);
            }
        }

        return switch (contentType) {
            case "application/pdf" -> ".pdf";
            case "image/png" -> ".png";
            default -> ".jpg";
        };
    }
}