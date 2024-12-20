const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
    artist_id: {
            type: mongoose.Schema.Types.ObjectId, ref: 'Artist' 
        },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    year: {
        type: Number,
        required: true,
    },
    hidden: {
        type: Boolean,
        default: false,
    },
    tracks: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Track' 
    }]
}, {
    timestamps: true
});

// Create the Album model
const Album = mongoose.model('Album', albumSchema);

module.exports = Album;