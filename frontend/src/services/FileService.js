// src/services/FileService.js
import axios from 'axios';

const API_URL = 'http://localhost:8081/api/files';

class FileService {
  // Upload a PDF file
  uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Get list of all PDF files
  getFilesList() {
    return axios.get(`${API_URL}/list`);
  }

  // Get thumbnail URL for a file
  getThumbnailUrl(fileName) {
    return `${API_URL}/thumbnail/${fileName}`;
  }

  // Apply stamp to a PDF
  stampFile(fileName, stampData) {
    return axios.post(`${API_URL}/stamp/${fileName}`, null, {
      params: {
        date: stampData.date,
        name: stampData.name,
        comment: stampData.comment
      }
    });
  }

  // Get download URL for a file
  getDownloadUrl(fileName) {
    return `${API_URL}/download/${fileName}`;
  }

  // Delete a file
  deleteFile(fileName) {
    return axios.delete(`${API_URL}/${fileName}`);
  }
}

export default new FileService();