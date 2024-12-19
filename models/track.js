const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
    track_id: {
        type: String, // UUID as a string
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    duration: {
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

// Create the Track model
const Track = mongoose.model('Track', trackSchema);

module.exports = Track;