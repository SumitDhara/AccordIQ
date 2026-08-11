package com.accordiq.ocr.provider.tesseract;

import com.accordiq.ocr.exception.OCRException;
import com.accordiq.ocr.model.OCRResult;
import com.accordiq.ocr.service.OCRService;
import lombok.RequiredArgsConstructor;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class TesseractOCRService implements OCRService {

    private final Tesseract tesseract;

    @Override
    public OCRResult extractText(Path filePath) {

        long start = System.currentTimeMillis();

        if (filePath == null || !Files.exists(filePath)) {
            throw new OCRException("File not found: " + filePath);
        }

        try {

            String name = filePath.getFileName()
                    .toString()
                    .toLowerCase(Locale.ROOT);

            String text;

            if (name.endsWith(".pdf")) {
                text = extractPdf(filePath);
            } else {
                text = extractImage(filePath);
            }

            return OCRResult.builder()
                    .extractedText(text)
                    .confidence(-1)
                    .processingTimeMillis(
                            System.currentTimeMillis() - start
                    )
                    .build();

        } catch (Exception ex) {

            throw new OCRException(
                    "OCR processing failed.",
                    ex
            );
        }
    }

    private String extractPdf(Path pdfPath)
            throws IOException, TesseractException {

        StringBuilder builder = new StringBuilder();

        try (PDDocument document =
                     Loader.loadPDF(pdfPath.toFile())) {

            PDFRenderer renderer =
                    new PDFRenderer(document);

            for (int i = 0;
                 i < document.getNumberOfPages();
                 i++) {

                BufferedImage image =
                        renderer.renderImageWithDPI(i, 150);

                try {

                    builder.append(
                            tesseract.doOCR(image)
                    );

                    builder.append(
                            System.lineSeparator()
                    );

                } finally {

                    image.flush();
                }
            }
        }

        return builder.toString();
    }

    private String extractImage(Path imagePath)
            throws IOException, TesseractException {

        BufferedImage image =
                ImageIO.read(imagePath.toFile());

        if (image == null) {
            throw new OCRException("Unsupported image.");
        }

        try {
            return tesseract.doOCR(image);

        } finally {
            image.flush();
        }
    }
}