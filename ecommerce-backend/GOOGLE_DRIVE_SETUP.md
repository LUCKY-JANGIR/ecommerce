# Google Drive Integration Setup Guide

## Current Implementation

The current implementation uses a local file storage approach that mimics Google Drive functionality. Images are stored locally in the `uploads/products/` directory and served via the `/uploads` static route.

## For Production Google Drive Integration

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API
4. Create a Service Account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Give it a name (e.g., "ecommerce-drive-service")
   - Grant "Editor" role
   - Create and download the JSON key file

### 2. Google Drive Setup

1. Create a folder in Google Drive for product images
2. Share the folder with the service account email (found in the JSON key file)
3. Give the service account "Editor" permissions

### 3. Backend Configuration

1. Place the service account JSON key file in the backend directory as `drive-service-account.json`
2. Update the `utils/drive.js` file to use actual Google Drive API:

```javascript
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class GoogleDriveService {
  constructor() {
    // Load service account credentials
    const credentials = require('../drive-service-account.json');
    
    this.auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });
    
    this.drive = google.drive({ version: 'v3', auth: this.auth });
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID; // Your folder ID
  }

  async uploadFile(file) {
    try {
      const fileMetadata = {
        name: `${Date.now()}_${file.originalname}`,
        parents: [this.folderId]
      };

      const media = {
        mimeType: file.mimetype,
        body: require('stream').Readable.from(file.buffer)
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink'
      });

      // Make the file publicly accessible
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });

      return {
        success: true,
        url: `https://drive.google.com/uc?export=view&id=${response.data.id}`,
        filename: response.data.name,
        driveUrl: response.data.webViewLink
      };
    } catch (error) {
      console.error('Google Drive upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteFile(fileId) {
    try {
      await this.drive.files.delete({
        fileId: fileId
      });
      return { success: true };
    } catch (error) {
      console.error('Google Drive delete error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new GoogleDriveService();
```

### 4. Environment Variables

Add these to your `.env` file:

```
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
```

### 5. Security Considerations

- Never commit the service account JSON file to version control
- Add `drive-service-account.json` to your `.gitignore`
- Use environment variables for sensitive configuration
- Consider using Google Cloud Secret Manager for production

## Current Development Setup

The current setup works with local file storage and is suitable for development. Images are:
- Stored in `uploads/products/`
- Served via `/uploads/products/filename`
- Accessible at `http://localhost:5001/uploads/products/filename`

This approach allows you to develop and test the image upload functionality without setting up Google Drive credentials. 