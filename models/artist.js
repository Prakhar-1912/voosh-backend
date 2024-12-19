// Import Mongoose
const mongoose = require('mongoose');

// Define the Artist schema
const artistSchema = new mongoose.Schema({
    artist_id: {
        type: String, // UUID as a string
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        trim: true, // Removes leading and trailing whitespaces
    },
    grammy: {
        type: Boolean,
        default: false, // Default value if not provided
    },
    hidden: {
        type: Boolean,
        default: false, // Default value if not provided
    }
}, {
    timestamps: true // Automatically add `createdAt` and `updatedAt` fields
});

// Create the Artist model
const Artist = mongoose.model('Artist', artistSchema);

// Export the model
module.exports = Artist;
