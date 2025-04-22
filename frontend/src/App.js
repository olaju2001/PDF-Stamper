// src/App.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Button, Accordion } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import PDFPreview from './components/PDFPreview';
import StampForm from './components/StampForm';
import ApiDebugger from './components/ApiDebugger';
import FileService from './services/FileService';

function App() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDebug, setShowDebug] = useState(false);

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
      
      // Debug: Log the raw response
      console.log("Files API response:", response);
      
      // Ensure we have an array of files with correct properties
      let fileArray = [];
      
      if (Array.isArray(response.data)) {
        fileArray = response.data.map(file => {
          // Ensure each file has either name or fileName property
          const fileName = file.name || file.fileName || file.url?.split('/').pop();
          return {
            ...file,
            // Add name property if it doesn't exist
            name: fileName
          };
        });
        
        console.log("Processed file array:", fileArray);
      } else {
        console.warn("API did not return an array:", response.data);
      }
      
      setFiles(fileArray);
      
      // If there are files and none is selected, select the first one
      if (fileArray.length > 0 && !selectedFile) {
        console.log("Auto-selecting first file:", fileArray[0]);
        setSelectedFile(fileArray[0]);
      }
    } catch (error) {
      console.error('Error loading files:', error);
      
      let errorMessage = "Fehler beim Laden der Dateien: ";
      
      if (error.response) {
        // Server responded with error
        errorMessage += `Serverfehler (${error.response.status}): ${error.response.data?.message || 'Unbekannter Fehler'}`;
      } else if (error.request) {
        // No response from server
        errorMessage += "Keine Verbindung zum Backend-Server. Läuft der Server auf Port 8081?";
      } else {
        // Other error
        errorMessage += error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload completion
  const handleFileUpload = (uploadResponse) => {
    console.log("File uploaded response:", uploadResponse);
    
    // Create a proper file object from the response
    const newFile = {
      name: uploadResponse.fileName,
      url: uploadResponse.fileDownloadUri,
      thumbnailUrl: uploadResponse.thumbnailUri,
      stamped: false
    };
    
    console.log("Adding new file to list:", newFile);
    
    setFiles(prevFiles => [...prevFiles, newFile]);
    setSelectedFile(newFile);
  };

  // Handle file selection from the list
  const handleSelectFile = (file) => {
    console.log("Selected file:", file);
    setSelectedFile(file);
  };

  // Handle file deletion
  const handleDeleteFile = (fileName) => {
    console.log("Deleting file:", fileName);
    
    setFiles(prevFiles => prevFiles.filter(file => (file.name || file.fileName) !== fileName));
    
    // If the deleted file was selected, clear the selection
    if (selectedFile && (selectedFile.name === fileName || selectedFile.fileName === fileName)) {
      setSelectedFile(null);
    }
  };

  // Handle file stamping
  const handleFileStamped = (stampedFileResponse) => {
    console.log("File stamped response:", stampedFileResponse);
    
    // Create a proper file object from the response
    const stampedFile = {
      name: stampedFileResponse.fileName,
      url: stampedFileResponse.fileDownloadUri,
      thumbnailUrl: stampedFileResponse.thumbnailUri,
      stamped: true
    };
    
    console.log("Adding stamped file to list:", stampedFile);
    
    // Add the new stamped file to the list
    setFiles(prevFiles => [...prevFiles, stampedFile]);
    
    // Update the selected file to the stamped version
    setSelectedFile(stampedFile);
  };

  return (
    <Container fluid className="pdf-stamper py-4">
      <h1 className="text-center mb-4">PDF Stempel</h1>
      
      {/* Error Messages */}
      {error && (
        <Alert variant="danger">
          <p>{error}</p>
          <div className="d-flex justify-content-between align-items-center">
            <Button variant="outline-danger" size="sm" onClick={loadFiles}>
              Erneut versuchen
            </Button>
            <Button variant="link" size="sm" onClick={() => setShowDebug(!showDebug)}>
              {showDebug ? 'Debug-Tools ausblenden' : 'Debug-Tools anzeigen'}
            </Button>
          </div>
        </Alert>
      )}
      
      {/* Debug Section - Only shown when there's an error or manually toggled */}
      {(showDebug || error) && (
        <Accordion defaultActiveKey={error ? "0" : ""} className="mb-4">
          <Accordion.Item eventKey="0">
            <Accordion.Header>Debug-Tools</Accordion.Header>
            <Accordion.Body>
              <ApiDebugger />
              <div className="mt-3">
                <h5>API-Konfiguration</h5>
                <p>Aktuelle API-URL: <code>{FileService.API_URL || 'http://localhost:8081/api/files'}</code></p>
                
                <h5>Ausgewählte Datei</h5>
                <pre className="bg-light p-2" style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {selectedFile ? JSON.stringify(selectedFile, null, 2) : 'Keine Datei ausgewählt'}
                </pre>
                
                <h5>Gebrauchsanweisung</h5>
                <ol>
                  <li>Stellen Sie sicher, dass Ihr Spring Boot-Backend auf Port 8081 läuft</li>
                  <li>Überprüfen Sie, ob CORS in WebConfig.java korrekt konfiguriert ist</li>
                  <li>Überprüfen Sie, ob die Uploads- und Thumbnails-Verzeichnisse existieren und die richtigen Berechtigungen haben</li>
                </ol>
              </div>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      )}
      
      <Row>
        {/* Left Column: Upload and File List */}
        <Col md={4}>
          <FileUpload onFileUpload={handleFileUpload} />
          <FileList 
            files={files}
            onSelectFile={handleSelectFile}
            onDeleteFile={handleDeleteFile}
            selectedFile={selectedFile?.name || selectedFile?.fileName}
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
      
      {/* Footer with debug toggle */}
      <div className="text-center mt-5">
        <Button 
          variant="link" 
          size="sm" 
          onClick={() => setShowDebug(!showDebug)}
          className="text-muted"
        >
          {showDebug ? 'Debug-Tools ausblenden' : 'Debug-Tools anzeigen'}
        </Button>
      </div>
    </Container>
  );
}

export default App;