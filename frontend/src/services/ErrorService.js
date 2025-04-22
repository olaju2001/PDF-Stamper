// src/services/ErrorService.js
import axios from 'axios';

class ErrorService {
  // Check if backend service is running
  async checkBackendStatus() {
    // Only use port 8081 as specified
    const port = 8081;
    
    try {
      // Try simple endpoint
      const response = await axios.get(`http://localhost:${port}/api/files/list`, {
        timeout: 3000 // 3 seconds timeout
      });
      
      return {
        status: 'connected',
        port: port,
        response: response.data
      };
    } catch (error) {
      let status = 'unknown';
      let message = error.message;
      
      if (error.code === 'ECONNREFUSED') {
        status = 'not_running';
        message = `No service running on port ${port}`;
      } else if (error.code === 'CORS_ERROR') {
        status = 'cors_issue';
        message = `CORS policy blocking request to port ${port}`;
      } else if (error.response) {
        status = 'error_response';
        message = `Server responded with status ${error.response.status}`;
      } else if (error.request) {
        status = 'no_response';
        message = `Request was made but no response from port ${port}`;
      }
      
      return {
        status: 'failed',
        results: { [port]: { status, message, error } }
      };
    }
  }
  
  // Diagnose common issues with the backend
  async diagnoseProblem() {
    const backendStatus = await this.checkBackendStatus();
    
    if (backendStatus.status === 'connected') {
      return {
        issue: 'none',
        message: `Successfully connected to backend on port ${backendStatus.port}`,
        details: backendStatus
      };
    }
    
    // Check the results
    const results = backendStatus.results;
    const port8081Result = results[8081];
    
    if (port8081Result.status === 'not_running') {
      return {
        issue: 'backend_not_running',
        message: 'The Spring Boot backend is not running on port 8081. Please start the backend server.',
        details: backendStatus
      };
    }
    
    if (port8081Result.status === 'cors_issue') {
      return {
        issue: 'cors_configuration',
        message: 'CORS policy is preventing the frontend from accessing the backend. Check WebConfig.java.',
        details: backendStatus
      };
    }
    
    return {
      issue: 'unknown',
      message: 'Could not determine the exact issue. Check server logs for more details.',
      details: backendStatus
    };
  }
  
  // Format specific error types with helpful messages
  formatErrorMessage(error) {
    if (!error) {
      return 'Unknown error occurred';
    }
    
    // Network or connection errors
    if (error.code === 'ECONNREFUSED') {
      return 'Cannot connect to backend server. Is the Spring Boot application running on port 8081?';
    }
    
    if (error.message && error.message.includes('Network Error')) {
      return 'Network error. This could be due to CORS configuration or backend server not running on port 8081.';
    }
    
    // Server errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 404:
          return 'API endpoint not found. Check if the URL is correct.';
        case 500:
          return `Server error: ${data.message || 'Internal server error'}`;
        default:
          return `Server responded with status ${status}: ${data.message || 'Unknown error'}`;
      }
    }
    
    // Generic error with message
    return error.message || 'Unknown error occurred';
  }
}

export default new ErrorService();