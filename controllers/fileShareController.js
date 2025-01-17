const { shareFile, getSharedFiles } = require('../models/FileShareModels');
const db = require('../config/db');
// Controller to handle sharing a file
async function shareFileController(req, res) {
    const { fileId, sharedWithEmail } = req.body;
    const ownerId = req.user.id; // Assuming user is authenticated

    try {
        const sharedFile = await shareFile({ fileId, ownerId, sharedWithEmail });
        res.json({ message: 'File shared successfully!', sharedFile });
    } catch (err) {
        console.error('Error sharing file:', err);
        res.status(500).json({ error: 'Failed to share file.' });
    }
}

// Controller to get shared files
async function getSharedFilesController(req, res) {
    
    try {
        const sharedWithEmailQuery = await db.query("Select emailid from users where id=$1",[req.user.id]); // Assuming user is authenticated
         console.log(sharedWithEmailQuery.rows[0].emailid)
        const sharedWithEmail=sharedWithEmailQuery.rows[0].emailid
        const sharedFiles = await getSharedFiles(sharedWithEmail);
        //res.json({ sharedFiles });
        const files=sharedFiles
        res.render('shared',{files})
    } catch (err) {
        console.error('Error fetching shared files:', err);
        res.redirect("/api/files")
    }
}

module.exports = {
    shareFileController,
    getSharedFilesController
};