const express = require('express');
const { client } = require('./config/db');
const bodyparser = require('body-parser');
const dotenv = require('dotenv');
const fileRoutes = require('./routes/fileRoutes');
const fileShareRoutes = require('./routes/fileShareRoutes');
const authRoutes = require('./routes/authRoutes');
const passport = require('./config/passportConfig'); // Import passport config
const session = require('express-session');
const path = require('path');

dotenv.config();
const app = express();

app.use(
    session({
        secret: 'FILEAUTH',
        resave: false,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());

client.connect();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/files', fileRoutes);
app.use('/api/files', fileShareRoutes);
app.use('/auth', authRoutes);
app.get("/",(req,res)=>{
    res.redirect('/api/files')
})

const PORT = process.env.APP_PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});