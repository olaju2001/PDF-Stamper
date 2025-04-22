// src/services/FileService.js
import axios from 'axios';

// Use port 8081 as specified
const API_URL = 'http://localhost:8081/api/files';

class FileService {
  constructor() {
    this.API_URL = API_URL;
  }

  // Upload a PDF file
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      return await axios.post(`${this.API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
      throw this.enhanceError(error, 'File upload failed');
    }
  }

  // Get list of all PDF files
  async getFilesList() {
    try {
      return await axios.get(`${this.API_URL}/list`);
    } catch (error) {
      console.error('List files error:', error);
      throw this.enhanceError(error, 'Failed to retrieve file list');
    }
  }

  // Get thumbnail URL for a file
  getThumbnailUrl(fileName) {
    if (!fileName) {
      console.error('getThumbnailUrl called with undefined fileName');
      return '/api/placeholder/400/320?text=No%20File%20Selected';
    }
    return `${this.API_URL}/thumbnail/${encodeURIComponent(fileName)}`;
  }

  // Apply stamp to a PDF
  async stampFile(fileName, stampData) {
    // Validate inputs before making the request
    if (!fileName) {
      console.error('stampFile called with undefined fileName');
      const error = new Error('File name is required for stamping');
      error.code = 'MISSING_FILENAME';
      throw error;
    }
    
    if (!stampData || !stampData.date || !stampData.name) {
      console.error('stampFile called with invalid stampData', stampData);
      const error = new Error('Date and name are required for stamping');
      error.code = 'INVALID_STAMP_DATA';
      throw error;
    }
    
    console.log(`Stamping file "${fileName}" with data:`, stampData);
    
    try {
      // Debug the URL that will be called
      const url = `${this.API_URL}/stamp/${encodeURIComponent(fileName)}`;
      console.log('Stamp API URL:', url);
      console.log('Stamp parameters:', stampData);
      
      return await axios.post(url, null, {
        params: {
          date: stampData.date,
          name: stampData.name,
          comment: stampData.comment || '' // Ensure comment is never undefined
        }
      });
    } catch (error) {
      console.error('Stamp error:', error);
      
      // Add specific debugging for stamp errors
      if (error.response && error.response.status === 500) {
        console.error('Server error details:', error.response.data);
      }
      
      throw this.enhanceError(error, 'Failed to apply stamp');
    }
  }

  // Get download URL for a file
  getDownloadUrl(fileName) {
    if (!fileName) {
      console.error('getDownloadUrl called with undefined fileName');
      return '#'; // Return a placeholder that won't navigate
    }
    return `${this.API_URL}/download/${encodeURIComponent(fileName)}`;
  }

  // Delete a file
  async deleteFile(fileName) {
    if (!fileName) {
      console.error('deleteFile called with undefined fileName');
      const error = new Error('File name is required for deletion');
      error.code = 'MISSING_FILENAME';
      throw error;
    }
    
    try {
      return await axios.delete(`${this.API_URL}/${encodeURIComponent(fileName)}`);
    } catch (error) {
      console.error('Delete error:', error);
      throw this.enhanceError(error, 'Failed to delete file');
    }
  }
  
  // Add more context to error messages
  enhanceError(error, prefix = 'API Error') {
    if (!error.enhancedMessage) {
      // Add user-friendly message
      if (error.response) {
        // Server returned an error response
        const status = error.response.status;
        const message = error.response.data?.message || 'Unknown server error';
        error.enhancedMessage = `${prefix}: Server returned ${status} - ${message}`;
      } else if (error.request) {
        // No response received
        error.enhancedMessage = `${prefix}: No response from server - check if backend is running on port 8081`;
      } else {
        // Error in setting up the request
        error.enhancedMessage = `${prefix}: ${error.message}`;
      }
    }
    return error;
  }
}

export default new FileService();