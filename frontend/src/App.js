// src/App.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import PDFPreview from './components/PDFPreview';
import StampForm from './components/StampForm';
import FileService from './services/FileService';

function App() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load files on component mount
  useEffect(() => {
    loadFiles();
  }, []);

  // Function to load all PDF files
  const loadFiles = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await FileService.getFilesList();
      setFiles(response.data);
      
      // If there are files and none is selected, select the first one
      if (response.data.length > 0 && !selectedFile) {
        setSelectedFile(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading files:', error);
      setError(`Failed to load files: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload completion
  const handleFileUpload = (newFile) => {
    setFiles(prevFiles => [...prevFiles, newFile]);
    setSelectedFile(newFile);
  };

  // Handle file selection from the list
  const handleSelectFile = (file) => {
    setSelectedFile(file);
  };

  // Handle file deletion
  const handleDeleteFile = (fileName) => {
    setFiles(prevFiles => prevFiles.filter(file => file.fileName !== fileName));
    
    // If the deleted file was selected, clear the selection
    if (selectedFile && selectedFile.fileName === fileName) {
      setSelectedFile(null);
    }
  };

  // Handle file stamping
  const handleFileStamped = (stampedFile) => {
    // Update the file in the list with the stamped version
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.fileName === stampedFile.fileName ? stampedFile : file
      )
    );
    
    // Update the selected file
    setSelectedFile(stampedFile);
  };

  return (
    <Container fluid className="pdf-stamper py-4">
      <h1 className="text-center mb-4">PDF Stamper</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        {/* Left Column: Upload and File List */}
        <Col md={4}>
          <FileUpload onFileUpload={handleFileUpload} />
          <FileList 
            files={files}
            onSelectFile={handleSelectFile}
            onDeleteFile={handleDeleteFile}
            selectedFile={selectedFile?.fileName}
          />
        </Col>
        
        {/* Right Column: Preview and Stamp Form */}
        <Col md={8}>
          <PDFPreview file={selectedFile} />
          <StampForm 
            file={selectedFile} 
            onFileStamped={handleFileStamped} 
          />
        </Col>
      </Row>
    </Container>
  );
}

export default App;