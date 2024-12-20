const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
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
    }
}, {
    timestamps: true
});

// Create the Album model
const Album = mongoose.model('Album', albumSchema);

module.exports = Album;