const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// For now, we'll use a simple approach with direct file upload
// In production, you'd want to use service account credentials
class GoogleDriveService {
    constructor() {
        // For development, we'll use a simple file storage approach
        // and return placeholder URLs that work with Google Drive sharing
        this.uploadDir = path.join(__dirname, '../uploads/products');

        // Ensure upload directory exists
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async uploadFile(file) {
        try {
            // Generate a unique filename
            const timestamp = Date.now();
            const originalName = file.originalname;
            const extension = path.extname(originalName);
            const filename = `${timestamp}_${path.basename(originalName, extension)}${extension}`;
            const filepath = path.join(this.uploadDir, filename);

            // Save file locally
            fs.writeFileSync(filepath, file.buffer);

            // For development, return a placeholder Google Drive URL
            // In production, you'd upload to actual Google Drive and get the real URL
            const driveUrl = `https://drive.google.com/uc?export=view&id=YOUR_FILE_ID_${filename}`;

            // For now, return a local URL that works with your current setup
            const localUrl = `/uploads/products/${filename}`;

            return {
                success: true,
                url: localUrl,
                filename: filename,
                driveUrl: driveUrl // This would be the actual Google Drive URL in production
            };
        } catch (error) {
            console.error('File upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async deleteFile(filename) {
        try {
            const filepath = path.join(this.uploadDir, filename);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
                return { success: true };
            }
            return { success: false, error: 'File not found' };
        } catch (error) {
            console.error('File deletion error:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new GoogleDriveService(); 