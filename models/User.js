const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        files: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'File', // Reference to the File model
            },
        ],
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;