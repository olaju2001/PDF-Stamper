// src/components/ApiDebugger.js
import React, { useState, useEffect } from 'react';
import { Alert, Button, Card, Accordion } from 'react-bootstrap';
import axios from 'axios';

const ApiDebugger = () => {
  const [apiStatus, setApiStatus] = useState({
    tested: false,
    working: false,
    error: null,
    details: null
  });
  const [expanded, setExpanded] = useState(false);
  // Just use port 8081 as specified
  const port = 8081;

  // Test the API connection
  const testApiConnection = async () => {
    setApiStatus({ ...apiStatus, tested: true, working: false });
    
    const results = {};
    
    try {
      const startTime = performance.now();
      const response = await axios.get(`http://localhost:${port}/api/files/list`, { timeout: 3000 });
      const endTime = performance.now();
      
      results[port] = {
        status: 'success',
        responseTime: Math.round(endTime - startTime),
        data: response.data
      };
      
      setApiStatus({
        tested: true,
        working: true,
        port: port,
        details: results
      });
    } catch (error) {
      results[port] = {
        status: 'error',
        message: error.message,
        code: error.code,
        response: error.response
      };
      
      // If we get here, the port didn't work
      setApiStatus({
        tested: true,
        working: false,
        error: `Keine Verbindung zur API auf Port ${port} möglich`,
        details: results
      });
    }
  };

  useEffect(() => {
    // Don't auto-run the test to avoid console errors
    // but leave this code here in case you want to enable it
    // testApiConnection();
  }, []);

  return (
    <Card className="mb-4">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <span>API-Verbindungsstatus</span>
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={testApiConnection}
          >
            {apiStatus.tested ? 'Verbindung erneut testen' : 'Verbindung testen'}
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {!apiStatus.tested && (
          <Alert variant="info">
            Klicken Sie auf "Verbindung testen", um die Backend-API-Konnektivität zu überprüfen
          </Alert>
        )}
        
        {apiStatus.tested && !apiStatus.working && (
          <Alert variant="danger">
            <p><strong>Backend-API antwortet nicht!</strong></p>
            <p>Überprüfen Sie, dass:</p>
            <ol>
              <li>Die Spring Boot-Anwendung läuft</li>
              <li>Die Anwendung auf Port 8081 läuft</li>
              <li>CORS korrekt konfiguriert ist, um Anfragen von localhost:3000 zuzulassen</li>
            </ol>
            <Button 
              variant="link" 
              size="sm" 
              className="p-0"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Details ausblenden' : 'Details anzeigen'}
            </Button>
            
            {expanded && apiStatus.details && (
              <div className="mt-3">
                <h6>Verbindungsdetails:</h6>
                {Object.entries(apiStatus.details).map(([port, result]) => (
                  <div key={port} className="mb-2">
                    <strong>Port {port}:</strong> {result.status === 'success' ? 'Verbunden' : 'Fehlgeschlagen'}
                    {result.status === 'error' && (
                      <div className="small text-muted">
                        Fehler: {result.message} {result.code ? `(${result.code})` : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Alert>
        )}
        
        {apiStatus.tested && apiStatus.working && (
          <Alert variant="success">
            <p><strong>Backend-API ist verbunden!</strong></p>
            <p>Erfolgreich mit Port {apiStatus.port} verbunden</p>
            <Button 
              variant="link" 
              size="sm" 
              className="p-0"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Details ausblenden' : 'Details anzeigen'}
            </Button>
            
            {expanded && apiStatus.details && apiStatus.details[apiStatus.port] && (
              <div className="mt-3">
                <h6>Verbindungsdetails:</h6>
                <p>Antwortzeit: {apiStatus.details[apiStatus.port].responseTime} ms</p>
                <p>Empfangene Daten:</p>
                <pre className="bg-light p-2" style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {JSON.stringify(apiStatus.details[apiStatus.port].data, null, 2)}
                </pre>
              </div>
            )}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default ApiDebugger;