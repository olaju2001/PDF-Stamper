package com.pdfstamper.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class FileStorageProperties {

    // Use @Value instead of relying on @ConfigurationProperties
    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    public String getUploadDir() {
        return uploadDir;
    }

    public void setUploadDir(String uploadDir) {
        this.uploadDir = uploadDir;
    }
}