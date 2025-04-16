package com.pdfstamper.controller;

import com.pdfstamper.service.FileStorageService;
import com.pdfstamper.service.PDFService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:3000") // for development with React
public class FileController {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private PDFService pdfService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        String fileName = fileStorageService.storeFile(file);

        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/files/download/")
                .path(fileName)
                .toUriString();

        String thumbnailUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/files/thumbnail/")
                .path(fileName)
                .toUriString();

        Map<String, String> response = new HashMap<>();
        response.put("fileName", fileName);
        response.put("fileDownloadUri", fileDownloadUri);
        response.put("thumbnailUri", thumbnailUri);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/list")
    public ResponseEntity<List<Map<String, Object>>> listFiles() {
        List<String> fileNames = fileStorageService.listAllFiles();

        List<Map<String, Object>> files = fileNames.stream().map(fileName -> {
            Map<String, Object> file = new HashMap<>();
            file.put("name", fileName);
            file.put("url", ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/files/download/")
                    .path(fileName)
                    .toUriString());
            file.put("thumbnailUrl", ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/files/thumbnail/")
                    .path(fileName)
                    .toUriString());
            file.put("stamped", fileName.startsWith("stamped_"));
            return file;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(files);
    }

    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        Resource resource = fileStorageService.loadFileAsResource(fileName);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/thumbnail/{fileName:.+}")
    public ResponseEntity<Resource> getThumbnail(@PathVariable String fileName) {
        // Generate JPEG if not already generated
        String jpegFileName = fileName.replace(".pdf", ".jpg");
        try {
            pdfService.generateFirstPageJpeg(fileName);
        } catch (Exception e) {
            // If error generating thumbnail, log it but continue
            System.err.println("Error generating thumbnail: " + e.getMessage());
        }

        // Load JPEG as resource
        Resource resource = fileStorageService.loadThumbnailAsResource(jpegFileName);

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + jpegFileName + "\"")
                .body(resource);
    }

    @PostMapping("/stamp/{fileName:.+}")
    public ResponseEntity<Map<String, String>> stampPDF(
            @PathVariable String fileName,
            @RequestParam String date,
            @RequestParam String name,
            @RequestParam String comment) {

        String stampedFileName = pdfService.stampPDF(fileName, date, name, comment);

        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/files/download/")
                .path(stampedFileName)
                .toUriString();

        String thumbnailUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/files/thumbnail/")
                .path(stampedFileName)
                .toUriString();

        Map<String, String> response = new HashMap<>();
        response.put("fileName", stampedFileName);
        response.put("fileDownloadUri", fileDownloadUri);
        response.put("thumbnailUri", thumbnailUri);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{fileName:.+}")
    public ResponseEntity<Map<String, Boolean>> deleteFile(@PathVariable String fileName) {
        fileStorageService.deleteFile(fileName);

        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", true);

        return ResponseEntity.ok(response);
    }
}