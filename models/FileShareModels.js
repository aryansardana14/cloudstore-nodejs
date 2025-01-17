const db = require('../config/db');

// Add a shared file entry
async function shareFile({ fileId, ownerId, sharedWithEmail }) {
    const query = `
        INSERT INTO shared_files (file_id, owner_id, shared_with_email)
        VALUES ($1, $2, $3) RETURNING *`;
    const values = [fileId, ownerId, sharedWithEmail];
    const result = await db.query(query, values);
    return result.rows[0];
}

// Get files shared with a specific email
async function getSharedFiles(sharedWithEmail) {
    const query = `
        SELECT f.id, f.filename, f.size, f.uploaded_at, u.emailid AS owner_email
        FROM shared_files sf
        JOIN files f ON sf.file_id = f.id
        JOIN users u ON sf.owner_id = u.id
        WHERE sf.shared_with_email = $1
        ORDER BY sf.shared_at DESC`;
    const result = await db.query(query, [sharedWithEmail]);
    return result.rows;
}

module.exports = {
    shareFile,
    getSharedFiles
};