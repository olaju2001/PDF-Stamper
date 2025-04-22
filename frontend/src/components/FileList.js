// src/components/FileList.js
import React from 'react';
import { Alert } from 'react-bootstrap';
import FileService from '../services/FileService';

const FileList = ({ files, onSelectFile, onDeleteFile, selectedFile }) => {
  console.log("Files received in FileList:", files);

  const handleDelete = async (e, fileName) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (window.confirm(`Sind Sie sicher, dass Sie "${fileName}" löschen möchten?`)) {
      try {
        await FileService.deleteFile(fileName);
        if (onDeleteFile) {
          onDeleteFile(fileName);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
        alert(`Fehler beim Löschen der Datei: ${error.message}`);
      }
    }
  };

  // Handle case where files is not an array
  if (!Array.isArray(files)) {
    console.error("Files is not an array:", files);
    return (
      <div className="file-list mb-4">
        <h3>PDF-Dateien</h3>
        <Alert variant="danger">
          Fehler: Ungültige Dateidaten empfangen. Bitte laden Sie die Seite neu.
        </Alert>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="file-list mb-4">
        <h3>PDF-Dateien</h3>
        <p className="text-muted">Noch keine PDF-Dateien hochgeladen.</p>
      </div>
    );
  }

  return (
    <div className="file-list mb-4">
      <h3>PDF-Dateien</h3>
      <div className="list-group">
        {files.map((file, index) => {
          // Determine file name (API might return name or fileName)
          const fileName = file.name || file.fileName;
          
          // Skip if no file name is available
          if (!fileName) {
            console.error("File missing name:", file);
            return null;
          }
          
          // Use plain divs instead of ListGroup components to avoid hydration errors
          return (
            <div 
              key={index}
              className={`list-group-item d-flex justify-content-between align-items-center ${selectedFile === fileName ? 'active' : ''}`}
              style={{cursor: 'pointer'}}
              onClick={() => onSelectFile(file)}
            >
              <div className="file-name text-truncate" style={{ maxWidth: '70%' }}>
                {fileName}
                {file.stamped && <span className="badge bg-info ms-2">Gestempelt</span>}
              </div>
              <a
                href="#"
                className="btn btn-danger btn-sm"
                onClick={(e) => handleDelete(e, fileName)}
              >
                Löschen
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileList;