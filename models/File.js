const db = require('../config/db'); // Your PostgreSQL connection

// Insert file metadata into the database
async function insertFile( userId, filename, s3Key, size ) {
    const query = `
        INSERT INTO files (user_id, filename, s3_key, size, uploaded_at) 
        VALUES ($1, $2, $3, $4, NOW()) 
        RETURNING *`;
        
    const values = [userId, filename, s3Key, size]; // Unpack object properties into an array
    console.log('Inserting file with values:', values[0]);

    const result = await db.query(query, [values[0].userId,values[0].filename,values[0].s3Key,values[0].size]);    // Pass individual values, not the whole object
    return result.rows[0];
}

// Get all files for a user
async function getFilesByUser(userId) {
    const query = `SELECT id, filename, size, uploaded_at FROM files WHERE user_id = $1 ORDER BY uploaded_at DESC`;
    const result = await db.query(query, [userId]);
    return result.rows;
}

// Get a specific file by ID
async function getFileById(fileId, userId) {
    const query = `SELECT * FROM files WHERE id = $1 AND user_id = $2`;
    const result = await db.query(query, [fileId, userId]);
    return result.rows[0];
}

// Update file name
async function renameFile(fileId, userId, newFilename) {
    const query = `
        UPDATE files 
        SET filename = $1, s3_key = $2 
        WHERE id = $3 AND user_id = $4 
        RETURNING *`;
        
    const newS3Key = `${userId}/${Date.now()}_${newFilename}`;
    const values = [newFilename, newS3Key, fileId, userId];
    
    const result = await db.query(query, values);
    return result.rows[0];
}
// Delete file
async function deleteFile(fileId, userId) {
    const query = `DELETE FROM files WHERE id = $1 AND user_id = $2 RETURNING *`;
    const result = await db.query(query, [fileId, userId]);
    return result.rows[0];
}

module.exports = {
    insertFile,
    getFilesByUser,
    getFileById,
    renameFile,
    deleteFile
};