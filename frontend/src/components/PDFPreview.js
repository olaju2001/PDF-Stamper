// src/components/PDFPreview.js
import React, { useState, useEffect } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import FileService from '../services/FileService';

const PDFPreview = ({ file }) => {
  const [thumbnailError, setThumbnailError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reset error state when file changes
  useEffect(() => {
    if (file) {
      setThumbnailError(false);
      setIsLoading(true);
    }
  }, [file]);

  if (!file) {
    return (
      <div className="pdf-preview mb-4">
        <h3>PDF-Vorschau</h3>
        <p className="text-muted">Wählen Sie eine PDF aus der Liste zur Vorschau aus.</p>
      </div>
    );
  }

  const handleDownload = () => {
    const downloadUrl = FileService.getDownloadUrl(file.name || file.fileName);
    window.open(downloadUrl, '_blank');
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = (e) => {
    console.error(`Error loading thumbnail for ${file.name || file.fileName}`);
    setThumbnailError(true);
    setIsLoading(false);
  };

  // Determine the correct file name property
  // Some API responses might use 'name' instead of 'fileName'
  const fileName = file.name || file.fileName;

  return (
    <div className="pdf-preview mb-4">
      <h3>PDF-Vorschau</h3>
      
      {thumbnailError && (
        <Alert variant="warning">
          Vorschaubild konnte nicht geladen werden. Möglicherweise hat das Backend Probleme bei der Erstellung der Vorschau.
        </Alert>
      )}
      
      <Card>
        <div className="thumbnail-container text-center p-3" style={{ minHeight: '300px' }}>
          {isLoading && <div className="text-center p-5">Vorschau wird geladen...</div>}
          
          {!thumbnailError && (
            <img
              src={FileService.getThumbnailUrl(fileName)}
              alt={`Vorschau von ${fileName}`}
              className="img-fluid border"
              style={{ maxHeight: '400px', display: thumbnailError ? 'none' : 'inline' }}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
          
          {thumbnailError && (
            <div className="text-center p-5 bg-light border">
              <p className="mb-0">Vorschau nicht verfügbar</p>
              <small className="text-muted">Datei: {fileName}</small>
            </div>
          )}
        </div>
        <Card.Body>
          <Card.Title className="text-truncate">{fileName}</Card.Title>
          <Button variant="primary" onClick={handleDownload}>
            PDF herunterladen
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PDFPreview;