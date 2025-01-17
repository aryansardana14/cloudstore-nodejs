const bcrypt = require('bcrypt');
const { client } = require('../config/db');
const saltRounds = 10;

// Render login page
function renderLogin(req, res) {
    res.render('login');
}

// Render registration page
function renderRegister(req, res) {
    res.render('register');
}

// Handle registration
async function registerUser(req, res) {
    const { username, password} = req.body;

    try {
        const checkResult = await client.query('SELECT * FROM users WHERE emailid = $1', [username]);
        if (checkResult.rows.length > 0) {
            console.log('User already registered');
            return res.redirect('/auth/login');
        }

        const hash = await bcrypt.hash(password, saltRounds);
        await client.query('INSERT INTO users (emailid, password) VALUES ($1, $2)', [username, hash]);
        console.log('User registered successfully');
        res.redirect('/auth/login');
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send('Registration failed');
    }
}

// Handle logout
function logoutUser(req, res) {
    req.logout((err) => {
        if (err) {
            console.error('Error during logout:', err);
            return next(err);
        }
        console.log('Logged out');
        res.redirect('/auth/login');
    });
}

module.exports = {
    renderLogin,
    renderRegister,
    registerUser,
    logoutUser,
};