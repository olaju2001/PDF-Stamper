// src/components/FileUpload.js
import React, { useState } from 'react';
import FileService from '../services/FileService';
import { Button, Form, Alert, ProgressBar } from 'react-bootstrap';

const FileUpload = ({ onFileUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setMessage('');
      setIsError(false);
    } else {
      setSelectedFile(null);
      setMessage('Bitte wählen Sie eine gültige PDF-Datei aus');
      setIsError(true);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      setMessage('Bitte wählen Sie zuerst eine Datei aus');
      setIsError(true);
      return;
    }

    try {
      setIsUploading(true);
      setProgress(30); // Simulate progress

      const response = await FileService.uploadFile(selectedFile);
      
      setProgress(100);
      setMessage('Datei erfolgreich hochgeladen');
      setIsError(false);
      
      // Call the parent callback to refresh file list
      if (onFileUpload) {
        onFileUpload(response.data);
      }

      // Reset file input
      setSelectedFile(null);
      document.getElementById('fileInput').value = '';
    } catch (error) {
      setProgress(0);
      setMessage(`Upload fehlgeschlagen: ${error.response?.data?.message || error.message}`);
      setIsError(true);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="file-upload mb-4 p-3 border rounded">
      <h3>PDF hochladen</h3>
      
      <Form.Group controlId="fileInput" className="mb-3">
        <Form.Label>PDF-Datei auswählen</Form.Label>
        <Form.Control 
          type="file" 
          onChange={onFileChange} 
          accept=".pdf"
          disabled={isUploading} 
        />
      </Form.Group>

      {isUploading && (
        <ProgressBar now={progress} label={`${progress}%`} className="mb-3" />
      )}

      <Button 
        variant="primary" 
        onClick={uploadFile} 
        disabled={!selectedFile || isUploading}
      >
        {isUploading ? 'Wird hochgeladen...' : 'Hochladen'}
      </Button>

      {message && (
        <Alert 
          variant={isError ? 'danger' : 'success'} 
          className="mt-3"
        >
          {message}
        </Alert>
      )}
    </div>
  );
};

export default FileUpload;