// src/components/FileList.js
import React from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import FileService from '../services/FileService';

const FileList = ({ files, onSelectFile, onDeleteFile, selectedFile }) => {
  const handleDelete = async (e, fileName) => {
    e.stopPropagation();
    
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      try {
        await FileService.deleteFile(fileName);
        if (onDeleteFile) {
          onDeleteFile(fileName);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
        alert(`Failed to delete file: ${error.message}`);
      }
    }
  };

  if (!files || files.length === 0) {
    return (
      <div className="file-list mb-4">
        <h3>PDF Files</h3>
        <p className="text-muted">No PDF files uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="file-list mb-4">
      <h3>PDF Files</h3>
      <ListGroup>
        {files.map((file, index) => (
          <ListGroup.Item 
            key={index}
            action
            active={selectedFile === file.fileName}
            onClick={() => onSelectFile(file)}
            className="d-flex justify-content-between align-items-center"
          >
            <div className="file-name text-truncate" style={{ maxWidth: '70%' }}>
              {file.fileName}
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={(e) => handleDelete(e, file.fileName)}
            >
              Delete
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default FileList;