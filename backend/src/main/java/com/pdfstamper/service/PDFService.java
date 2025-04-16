package com.pdfstamper.service;

import com.pdfstamper.config.FileStorageProperties;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class PDFService {

    private final Path fileStorageLocation;
    private final Path thumbnailStorageLocation;

    @Autowired
    public PDFService(FileStorageProperties fileStorageProperties) {
        this.fileStorageLocation = Paths.get(fileStorageProperties.getUploadDir())
                .toAbsolutePath().normalize();
        this.thumbnailStorageLocation = Paths.get(fileStorageProperties.getUploadDir() + "/thumbnails")
                .toAbsolutePath().normalize();
    }

    public String generateFirstPageJpeg(String fileName) {
        try {
            File pdfFile = this.fileStorageLocation.resolve(fileName).toFile();
            String jpegFileName = fileName.replace(".pdf", ".jpg");
            File jpegFile = this.thumbnailStorageLocation.resolve(jpegFileName).toFile();

            try (PDDocument document = PDDocument.load(pdfFile)) {
                PDFRenderer pdfRenderer = new PDFRenderer(document);

                // Render the first page to an image with 300 DPI
                BufferedImage image = pdfRenderer.renderImageWithDPI(0, 300, ImageType.RGB);

                // Save the image as JPEG
                ImageIO.write(image, "JPEG", jpegFile);
            }

            return jpegFileName;
        } catch (IOException e) {
            throw new RuntimeException("Could not generate JPEG for " + fileName, e);
        }
    }

    public String stampPDF(String fileName, String date, String name, String comment) {
        try {
            File pdfFile = this.fileStorageLocation.resolve(fileName).toFile();
            String stampedFileName = "stamped_" + fileName;
            File stampedFile = this.fileStorageLocation.resolve(stampedFileName).toFile();

            try (PDDocument document = PDDocument.load(pdfFile)) {
                int pageCount = document.getNumberOfPages();

                // Stamp each page
                for (int i = 0; i < pageCount; i++) {
                    PDPage page = document.getPage(i);
                    PDRectangle pageSize = page.getMediaBox();

                    try (PDPageContentStream contentStream = new PDPageContentStream(
                            document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {

                        // Set font and size
                        contentStream.setFont(PDType1Font.HELVETICA, 12);

                        // Position at bottom of page with some margin
                        float margin = 50;
                        float y = margin;

                        // Draw stamp content
                        contentStream.beginText();
                        contentStream.newLineAtOffset(margin, y);
                        contentStream.showText("Date: " + date);
                        contentStream.newLineAtOffset(0, 15);
                        contentStream.showText("Name: " + name);
                        contentStream.newLineAtOffset(0, 15);
                        contentStream.showText("Comment: " + comment);
                        contentStream.endText();
                    }
                }

                document.save(stampedFile);
            }

            // Also generate a thumbnail for the stamped version
            generateFirstPageJpeg(stampedFileName);

            return stampedFileName;
        } catch (IOException e) {
            throw new RuntimeException("Could not stamp PDF " + fileName, e);
        }
    }
}