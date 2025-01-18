const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand,CopyObjectCommand } = require('@aws-sdk/client-s3');
const { insertFile, getFilesByUser, getFileById, renameFile, deleteFile } = require('../models/File');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const multer = require('multer');
const path = require('path');
require('dotenv').config();
// Configure AWS S3
const s3 = new S3Client({ region: process.env.APP_AWS_REGION ,credentials:{
    accessKeyId: process.env.APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY
}});
const bucketName = process.env.APP_AWS_S3_BUCKET;

// Configure multer for file upload
const upload = multer({
    storage: multer.memoryStorage(), // Store files in memory before uploading to S3
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).single('file');

// Upload file to S3 and save metadata in PostgreSQL
async function uploadFile(req, res) {
    upload(req, res, async (err) => {
        if (err) return res.status(400).json({ error: 'File upload failed', details: err.message });

        try {
            const { originalname, buffer, size } = req.file;
            const userId = req.user.id
            const s3Key = `${userId}/${Date.now()}_${originalname}`;

            // Upload to S3
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: s3Key,
                Body: buffer,
                ContentType: req.file.mimetype
            });
            await s3.send(command);

            // Save file metadata in DB
            const fileData = await insertFile({ userId, filename: originalname, s3Key, size });

            res.redirect("/api/files")
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to upload file' });
        }
    });
}

// Get all files for a user
async function getUserFiles(req, res) {
    try {
        console.log(req.user)
        const userId = req.user.id;
        const files = await getFilesByUser(userId);
        console.log(files);
        res.render('files',{files})
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve files' });
    }
}

// Download file
async function downloadFile(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const file = await getFileById(id, userId);

        if (!file) return res.status(404).json({ error: 'File not found' });

        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: file.s3_key
        });

        const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 60 }); // URL valid for 60 seconds
        console.log(downloadUrl)
        res.redirect(downloadUrl);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to download file' });
    }
}

// Rename file
async function renameUserFile(req, res) {
    try {
        const { id } = req.params;
        const { newFilename } = req.body;
        const userId = req.user.id; // Hardcoded for now; replace with req.user.id when auth is added

        // Get the file from the database
        const file = await getFileById(id, userId);
        if (!file) return res.status(404).json({ error: 'File not found' });

        const oldS3Key = file.s3_key;
        const newS3Key = `${userId}/${Date.now()}_${newFilename}`;

        // Copy the object in S3 with a new key
        await s3.send(new CopyObjectCommand({
            Bucket: bucketName,
            CopySource: `${bucketName}/${oldS3Key}`,
            Key: newS3Key
        }));

        // Delete the old object in S3
        await s3.send(new DeleteObjectCommand({
            Bucket: bucketName,
            Key: oldS3Key
        }));

        // Update the filename and S3 key in the database
        const updatedFile = await renameFile(id, userId, newFilename);
        updatedFile.s3_key = newS3Key; // Add the new S3 key to the updated file object

        res.json({ message: 'File renamed successfully', file: updatedFile });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to rename file' });
    }
}

// Delete file
async function deleteUserFile(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const file = await getFileById(id, userId);

        if (!file) return res.status(404).json({ error: 'File not found' });

        // Delete from S3
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: file.s3_key
        });
        await s3.send(command);

        // Delete from DB
        await deleteFile(id, userId);

        res.json({ message: 'File deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete file' });
    }
}

module.exports = {
    uploadFile,
    getUserFiles,
    downloadFile,
    renameUserFile,
    deleteUserFile
};