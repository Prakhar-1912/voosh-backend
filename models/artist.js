// Import Mongoose
const mongoose = require('mongoose');

// Define the Artist schema
const artistSchema = new mongoose.Schema({
    artist_id: {
        type: String, 
        unique: true,
    },
    name: {
        type: String,
        required: true,
        trim: true, 
    },
    grammy: {
        type: Number,
        required: true,
    },
    hidden: {
        type: Boolean,
        default: false, 
    }
}, {
    timestamps: true 
});

// Create the Artist model
const Artist = mongoose.model('Artist', artistSchema);

// Export the model
module.exports = Artist;
