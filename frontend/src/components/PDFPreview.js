// src/components/PDFPreview.js
import React from 'react';
import { Card, Button } from 'react-bootstrap';
import FileService from '../services/FileService';

const PDFPreview = ({ file }) => {
  if (!file) {
    return (
      <div className="pdf-preview mb-4">
        <h3>PDF Preview</h3>
        <p className="text-muted">Select a PDF from the list to preview.</p>
      </div>
    );
  }

  const handleDownload = () => {
    const downloadUrl = FileService.getDownloadUrl(file.fileName);
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="pdf-preview mb-4">
      <h3>PDF Preview</h3>
      <Card>
        <div className="thumbnail-container text-center p-3">
          <img
            src={FileService.getThumbnailUrl(file.fileName)}
            alt={`Preview of ${file.fileName}`}
            className="img-fluid border"
            style={{ maxHeight: '400px' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/400x500?text=Error+Loading+Preview';
            }}
          />
        </div>
        <Card.Body>
          <Card.Title className="text-truncate">{file.fileName}</Card.Title>
          <Button variant="primary" onClick={handleDownload}>
            Download PDF
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PDFPreview;