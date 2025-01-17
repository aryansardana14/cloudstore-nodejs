const express = require('express');
const router = express.Router();
const passport = require('../config/passportConfig');
const { renderLogin, renderRegister, registerUser, logoutUser } = require('../controllers/authController');

// Render login and register pages
router.get('/login', renderLogin);
router.get('/register', renderRegister);

// Handle registration
router.post('/register', registerUser);

// Handle login using Passport local strategy
router.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/api/files',
        failureRedirect: '/auth/login',
    })
);

// Handle Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/api/files',
    passport.authenticate('google', {
        successRedirect: '/api/files',
        failureRedirect: '/auth/login',
    })
);

// Handle logout
router.post('/logout', logoutUser);

module.exports = router;