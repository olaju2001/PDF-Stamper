// src/components/StampForm.js
import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import FileService from '../services/FileService';

const StampForm = ({ file, onFileStamped }) => {
  const [stampData, setStampData] = useState({
    date: new Date().toLocaleDateString('de-DE'),
    name: '',
    comment: ''
  });
  const [isStamping, setIsStamping] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStampData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyStamp = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setMessage('Bitte wählen Sie zuerst eine PDF-Datei aus');
      setIsError(true);
      return;
    }

    // Determine the file name property (some APIs use name, others use fileName)
    const fileName = file.name || file.fileName;
    
    // Debug logging
    console.log("Stamping file:", fileName);
    console.log("File object:", file);
    
    if (!fileName) {
      setMessage('Der Dateiname für den Stempel kann nicht ermittelt werden. Das Dateiobjekt könnte ungültig sein.');
      setIsError(true);
      console.error("Invalid file object:", file);
      return;
    }

    try {
      setIsStamping(true);
      setMessage('Stempel wird angewendet...');
      setIsError(false);

      const response = await FileService.stampFile(fileName, stampData);
      
      setMessage('Stempel erfolgreich angewendet');
      
      // Call the parent callback to refresh the preview
      if (onFileStamped) {
        onFileStamped(response.data);
      }
    } catch (error) {
      // Extract more detailed error message if available
      let errorMsg = "Fehler beim Anwenden des Stempels";
      
      if (error.response && error.response.data) {
        errorMsg += `: ${error.response.data.message || error.response.statusText}`;
      } else if (error.message) {
        errorMsg += `: ${error.message}`;
      }
      
      // Log detailed error info
      console.error("Stamp error details:", error);
      
      setMessage(errorMsg);
      setIsError(true);
    } finally {
      setIsStamping(false);
    }
  };

  return (
    <div className="stamp-form mb-4 p-3 border rounded">
      <h3>Stempel anwenden</h3>
      
      {!file ? (
        <p className="text-muted">Wählen Sie eine PDF aus der Liste aus, um einen Stempel anzuwenden.</p>
      ) : (
        <Form onSubmit={applyStamp}>
          <Form.Group className="mb-3" controlId="stampDate">
            <Form.Label>Datum</Form.Label>
            <Form.Control
              type="text"
              name="date"
              value={stampData.date}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="stampName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={stampData.name}
              onChange={handleChange}
              placeholder="Geben Sie Ihren Namen ein"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="stampComment">
            <Form.Label>Kommentar</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="comment"
              value={stampData.comment}
              onChange={handleChange}
              placeholder="Geben Sie Ihren Kommentar ein"
            />
          </Form.Group>

          <div className="d-flex justify-content-between align-items-start">
            <Button 
              variant="success" 
              type="submit" 
              disabled={isStamping}
            >
              {isStamping ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Stempel wird angewendet...
                </>
              ) : (
                'Stempel anwenden'
              )}
            </Button>
            
            {file && (
              <div className="text-muted small">
                Datei: {file.name || file.fileName}
              </div>
            )}
          </div>

          {message && (
            <Alert 
              variant={isError ? 'danger' : 'success'} 
              className="mt-3"
            >
              {message}
            </Alert>
          )}
        </Form>
      )}
    </div>
  );
};

export default StampForm;