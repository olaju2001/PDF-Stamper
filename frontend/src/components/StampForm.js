// src/components/StampForm.js
import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import FileService from '../services/FileService';

const StampForm = ({ file, onFileStamped }) => {
  const [stampData, setStampData] = useState({
    date: new Date().toLocaleDateString(),
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
      setMessage('Please select a PDF file first');
      setIsError(true);
      return;
    }

    try {
      setIsStamping(true);
      setMessage('Applying stamp...');
      setIsError(false);

      const response = await FileService.stampFile(file.fileName, stampData);
      
      setMessage('Stamp applied successfully');
      
      // Call the parent callback to refresh the preview
      if (onFileStamped) {
        onFileStamped(response.data);
      }
    } catch (error) {
      setMessage(`Failed to apply stamp: ${error.response?.data?.message || error.message}`);
      setIsError(true);
    } finally {
      setIsStamping(false);
    }
  };

  return (
    <div className="stamp-form mb-4 p-3 border rounded">
      <h3>Apply Stamp</h3>
      
      {!file ? (
        <p className="text-muted">Select a PDF from the list to apply a stamp.</p>
      ) : (
        <Form onSubmit={applyStamp}>
          <Form.Group className="mb-3" controlId="stampDate">
            <Form.Label>Date</Form.Label>
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
              placeholder="Enter your name"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="stampComment">
            <Form.Label>Comment</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="comment"
              value={stampData.comment}
              onChange={handleChange}
              placeholder="Enter your comment"
            />
          </Form.Group>

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
                Applying Stamp...
              </>
            ) : (
              'Apply Stamp'
            )}
          </Button>

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