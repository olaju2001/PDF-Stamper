# PDF Stamper Documentation

## Overview

PDF Stamper is a web application that allows users to upload PDF files, view thumbnails of the first page, apply text stamps to the documents, and download or delete the processed files. The application consists of a Spring Boot backend and a React frontend.

## System Architecture

The application follows a client-server architecture:

1. **Backend**: Java with Spring Boot
2. **Frontend**: React.js
3. **Communication**: RESTful API endpoints

```
+--------------------+       +----------------------+
|                    |       |                      |
|  React Frontend    | <---> |  Spring Boot Backend |
|                    |       |                      |
+--------------------+       +----------------------+
```

## Backend Implementation

### Core Components

The backend is built with Spring Boot and organized into the following components:

#### Configuration

- **FileStorageProperties.java**: Configures file storage locations and properties.

#### Controllers

- **FileController.java**: Exposes REST endpoints for file operations:
  - `POST /api/files/upload`: Upload a PDF file
  - `GET /api/files/list`: List all uploaded files
  - `GET /api/files/thumbnail/{fileName}`: Get the JPEG thumbnail of a PDF's first page
  - `POST /api/files/stamp/{fileName}`: Apply a text stamp to a PDF
  - `GET /api/files/download/{fileName}`: Download a PDF file
  - `DELETE /api/files/{fileName}`: Delete a PDF file

#### Exceptions

- **FileNotFoundException.java**: Custom exception for when a requested file doesn't exist
- **FileStorageException.java**: Custom exception for file storage issues

#### Models

- **FileResponse.java**: Response model containing file metadata
- **StampRequest.java**: Model for stamp request parameters (date, name, comment)

#### Services

- **FileStorageService.java**: Handles file storage operations (save, retrieve, delete)
- **PDFService.java**: Processes PDF files (thumbnail generation, stamping)

### Key Features

1. **File Upload**: Securely stores uploaded PDF files.
2. **Thumbnail Generation**: Converts the first page of a PDF to a JPEG image.
3. **PDF Stamping**: Applies text stamps (date, name, comment) at a fixed position on PDFs.
4. **File Management**: Lists, downloads, and deletes files.

### Directory Structure

```
uploads/
├── thumbnails/    # Stores JPEG thumbnails
└── [PDF files]    # Stores original and stamped PDFs
```

## Frontend Implementation

### Components

The React frontend consists of these main components:

1. **FileUpload.js**: Handles file selection and uploading to the backend.
2. **FileList.js**: Displays a list of all uploaded PDF files.
3. **PDFPreview.js**: Shows the thumbnail image of the selected PDF.
4. **StampForm.js**: Provides inputs for stamp content (date, name, comment).

### Services

- **FileService.js**: Handles API communication with the backend.

### User Interface Flow

1. User uploads a PDF file through the upload component.
2. The file appears in the file list.
3. When a file is selected, its thumbnail is displayed.
4. User enters stamp information and clicks the stamp button.
5. The thumbnail updates to show the stamped version.
6. User can download the stamped PDF or delete files.

## API Endpoints

| Method | Endpoint                        | Description                             | Request Body/Params                  | Response                                |
|--------|--------------------------------|-----------------------------------------|-------------------------------------|----------------------------------------|
| POST   | /api/files/upload              | Upload a new PDF file                   | form-data with "file" key           | FileResponse JSON                       |
| GET    | /api/files/list                | Get list of all uploaded files          | -                                   | Array of FileResponse objects           |
| GET    | /api/files/thumbnail/{fileName}| Get thumbnail of a PDF's first page     | fileName (path variable)            | JPEG image                              |
| POST   | /api/files/stamp/{fileName}    | Apply a stamp to a PDF                  | fileName (path), query params: date, name, comment | FileResponse JSON             |
| GET    | /api/files/download/{fileName} | Download a PDF file                     | fileName (path variable)            | PDF file                                |
| DELETE | /api/files/{fileName}          | Delete a PDF file                       | fileName (path variable)            | JSON with "deleted" status              |

## Error Handling

The application includes comprehensive error handling for:

- File not found
- Storage issues
- PDF processing errors
- CORS configuration
- File size limitations

## Testing

### Backend Testing

The backend can be tested using Postman or cURL:

1. **Upload Test**: POST a PDF file to `/api/files/upload`
2. **List Test**: GET file list from `/api/files/list`
3. **Thumbnail Test**: GET thumbnail from `/api/files/thumbnail/{fileName}`
4. **Stamp Test**: POST stamp request to `/api/files/stamp/{fileName}` with query parameters
5. **Download Test**: GET file from `/api/files/download/{fileName}`
6. **Delete Test**: DELETE file at `/api/files/{fileName}`

Detailed step-by-step testing instructions are available in the "Backend testing steps with Postman" document.

## Requirements

### Backend Requirements

- Java JDK 11 or higher
- Spring Boot
- Apache PDFBox (for PDF processing)
- Maven

### Frontend Requirements

- Node.js
- React
- npm or yarn

## Setup and Installation

### Backend Setup

1. Navigate to the `backend` directory
2. Run `mvn install` to install dependencies
3. Configure `application.properties` as needed
4. Run `mvn spring-boot:run` to start the server

### Frontend Setup

1. Navigate to the `frontend` directory
2. Run `npm install` to install dependencies
3. Configure the API base URL in `FileService.js` if needed
4. Run `npm start` to start the development server

## Development Timeline

Based on the requirements checklist, the total estimated development time is 8-10 hours:

- Backend implementation: 4-5 hours
- Frontend implementation: 4-5 hours

## Security Considerations

- Secure file handling
- Input validation
- Proper error handling
- CORS configuration

## Future Enhancements

Potential improvements for future versions:

1. User authentication
2. Multiple stamp templates
3. Custom stamp positioning
4. Batch processing
5. Cloud storage integration
6. Support for other document formats

## Conclusion

The PDF Stamper is a lightweight yet functional solution for basic PDF stamping needs. Its modular architecture makes it easy to extend and maintain.