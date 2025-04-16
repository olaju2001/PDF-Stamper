package com.pdfstamper.service;

import com.pdfstamper.config.FileStorageProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    private final Path thumbnailStorageLocation;

    @Autowired
    public FileStorageService(FileStorageProperties fileStorageProperties) {
        this.fileStorageLocation = Paths.get(fileStorageProperties.getUploadDir())
                .toAbsolutePath().normalize();
        this.thumbnailStorageLocation = Paths.get(fileStorageProperties.getUploadDir() + "/thumbnails")
                .toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
            Files.createDirectories(this.thumbnailStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directories where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        // Normalize file name
        String fileName = StringUtils.cleanPath(file.getOriginalFilename());

        try {
            // Check if the file's name contains invalid characters
            if (fileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + fileName);
            }

            // Check if file is a PDF
            if (!file.getContentType().equals("application/pdf")) {
                throw new RuntimeException("File must be a PDF");
            }

            // Copy file to the target location (Replacing existing file with the same name)
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found " + fileName, ex);
        }
    }

    public Resource loadThumbnailAsResource(String fileName) {
        try {
            Path filePath = this.thumbnailStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("Thumbnail not found " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("Thumbnail not found " + fileName, ex);
        }
    }

    public List<String> listAllFiles() {
        try {
            return Files.list(this.fileStorageLocation)
                    .filter(path -> !Files.isDirectory(path)) // Filter out directories
                    .map(path -> path.getFileName().toString())
                    .filter(fileName -> fileName.toLowerCase().endsWith(".pdf")) // Only PDF files
                    .collect(Collectors.toList());
        } catch (IOException ex) {
            throw new RuntimeException("Failed to list stored files", ex);
        }
    }

    public void deleteFile(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);

            // Also delete the thumbnail if it exists
            String thumbnailName = fileName.replace(".pdf", ".jpg");
            Path thumbnailPath = this.thumbnailStorageLocation.resolve(thumbnailName).normalize();
            Files.deleteIfExists(thumbnailPath);
        } catch (IOException ex) {
            throw new RuntimeException("Failed to delete file " + fileName, ex);
        }
    }
}