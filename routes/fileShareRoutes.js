const express = require('express');
const router = express.Router();
const { shareFileController, getSharedFilesController } = require('../controllers/fileShareController');
const isAuthenticated = require('../middleware/authMiddleware');

// Route to share a file (POST)
router.post('/share',isAuthenticated,  shareFileController);

// Route to get shared files (GET)
router.get('/shared',isAuthenticated, getSharedFilesController);

module.exports = router;