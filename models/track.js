const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
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
    },
    album_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Album' 
    },
    artist_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Artist' 
    }
}, {
    timestamps: true
});

// Create the Track model
const Track = mongoose.model('Track', trackSchema);

module.exports = Track;