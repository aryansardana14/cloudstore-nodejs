const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const bcrypt = require('bcrypt');
const { client } = require('./db');

// Local Strategy
passport.use(
    'local',
    new LocalStrategy(async (username, password, cb) => {
        try {
            const checkResult = await client.query('SELECT * FROM users WHERE emailid = $1', [username]);

            if (checkResult.rows.length > 0) {
                const user = checkResult.rows[0];
                console.log('User found');
                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) return cb(err);
                    if (result) {
                        console.log('Password verified');
                        return cb(null, user);
                    } else {
                        console.log('Auth failed');
                        return cb(null, false);
                    }
                });
            } else {
                console.log('User not found');
                return cb(null, false, { message: 'User not found' });
            }
        } catch (err) {
            console.error('Error in local strategy:', err);
            return cb(err);
        }
    })
);

// Google OAuth Strategy
passport.use(
    'google',
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://cloudstore-nodejs-w4np.vercel.app/auth/google/api/files',
            userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
        },
        async (accessToken, refreshToken, profile, cb) => {
            console.log(profile);
            try {
                const result = await client.query('SELECT * FROM users WHERE emailid = $1', [profile.email]);
                if (result.rows.length === 0) {
                    // User not found -> create user
                    const newUser = await client.query(
                        'INSERT INTO users (emailid, password) VALUES ($1, $2) RETURNING *',
                        [profile.email, 'google']
                    );
                    return cb(null, newUser.rows[0]);
                } else {
                    return cb(null, result.rows[0]);
                }
            } catch (err) {
                console.error('Error in Google strategy:', err);
                return cb(err);
            }
        }
    )
);

// Serialize user
passport.serializeUser((user, cb) => {
    cb(null, user.id); // Serialize only the user ID
});

// Deserialize user
passport.deserializeUser(async (id, cb) => {
    try {
        const result = await client.query('SELECT id, emailid FROM users WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            cb(null, result.rows[0]);
        } else {
            cb('User not found');
        }
    } catch (err) {
        console.error('Error in deserializing user:', err);
        cb(err);
    }
});

module.exports = passport;