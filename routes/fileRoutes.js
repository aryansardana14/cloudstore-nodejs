const express = require('express');
const router = express.Router();
const { uploadFile, getUserFiles, downloadFile, renameUserFile, deleteUserFile } = require('../controllers/filecontroller');
const isAuthenticated = require('../middleware/authMiddleware');
router.post('/upload',isAuthenticated,  uploadFile);
router.get('/upload',isAuthenticated,  (req,res)=>{
    res.render("upload")
});
router.get('/',isAuthenticated,  getUserFiles);
router.get('/download/:id',isAuthenticated, downloadFile);
router.post('/rename/:id',isAuthenticated,  renameUserFile);
router.delete('/delete/:id',isAuthenticated,  deleteUserFile);

module.exports = router;