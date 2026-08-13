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
import javax.imageio.ImageReadParam;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class TesseractOCRService implements OCRService {

    /*
     * Render Free has limited memory.
     *
     * Images such as a 2.4 MB JPEG can expand to hundreds
     * of MB when decoded into a BufferedImage.
     *
     * Decode large images using subsampling instead of
     * loading their full resolution into memory.
     */
    private static final int MAX_IMAGE_DIMENSION = 2500;

    /*
     * Keep PDF rendering conservative for Render Free.
     */
    private static final int PDF_DPI = 120;

    private static final int MAX_PDF_PAGES = 20;

    private final Tesseract tesseract;

    @Override
    public OCRResult extractText(Path filePath) {

        long start = System.currentTimeMillis();

        if (filePath == null || !Files.exists(filePath)) {
            throw new OCRException(
                    "File not found: " + filePath
            );
        }

        try {

            String name = filePath
                    .getFileName()
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

        } catch (OCRException exception) {

            throw exception;

        } catch (Exception exception) {

            throw new OCRException(
                    "OCR processing failed.",
                    exception
            );
        }
    }

    private String extractPdf(Path pdfPath)
            throws IOException, TesseractException {

        StringBuilder builder = new StringBuilder();

        try (PDDocument document =
                     Loader.loadPDF(pdfPath.toFile())) {

            int pageCount =
                    document.getNumberOfPages();

            if (pageCount > MAX_PDF_PAGES) {

                throw new OCRException(
                        "PDF exceeds the maximum supported length of "
                                + MAX_PDF_PAGES
                                + " pages."
                );
            }

            PDFRenderer renderer =
                    new PDFRenderer(document);

            for (int i = 0; i < pageCount; i++) {

                BufferedImage image =
                        renderer.renderImageWithDPI(
                                i,
                                PDF_DPI
                        );

                try {

                    builder.append(
                            tesseract.doOCR(image)
                    );

                    builder.append(
                            System.lineSeparator()
                    );

                } finally {

                    /*
                     * Explicitly release the rendered
                     * page before processing the next one.
                     */
                    image.flush();
                }
            }
        }

        return builder.toString();
    }

    private String extractImage(Path imagePath)
            throws IOException, TesseractException {

        BufferedImage image =
                readMemorySafeImage(imagePath);

        if (image == null) {

            throw new OCRException(
                    "Unsupported or invalid image."
            );
        }

        try {

            return tesseract.doOCR(image);

        } finally {

            /*
             * Explicitly release image memory.
             */
            image.flush();
        }
    }

    /**
     * Reads an image without first decoding its full
     * original resolution into memory.
     *
     * This is important for large phone/camera images.
     */
    private BufferedImage readMemorySafeImage(
            Path imagePath
    ) throws IOException {

        try (ImageInputStream input =
                     ImageIO.createImageInputStream(
                             imagePath.toFile()
                     )) {

            if (input == null) {

                throw new OCRException(
                        "Unable to read image."
                );
            }

            Iterator<ImageReader> readers =
                    ImageIO.getImageReaders(input);

            if (!readers.hasNext()) {

                throw new OCRException(
                        "Unsupported image format."
                );
            }

            ImageReader reader =
                    readers.next();

            try {

                reader.setInput(
                        input,
                        true,
                        true
                );

                int width =
                        reader.getWidth(0);

                int height =
                        reader.getHeight(0);

                int largestDimension =
                        Math.max(width, height);

                /*
                 * Calculate a decoding subsampling factor.
                 *
                 * Example:
                 *
                 * 6000px image
                 * -> approximately 3000px with factor 2
                 *
                 * 12000px image
                 * -> approximately 2400px with factor 5
                 */
                int subsampling =
                        Math.max(
                                1,
                                (int) Math.ceil(
                                        (double) largestDimension
                                                / MAX_IMAGE_DIMENSION
                                )
                        );

                ImageReadParam param =
                        reader.getDefaultReadParam();

                param.setSourceSubsampling(
                        subsampling,
                        subsampling,
                        0,
                        0
                );

                return reader.read(
                        0,
                        param
                );

            } finally {

                reader.dispose();
            }
        }
    }
}