//models/artist.js
const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true, 
    },
    grammy: {
        type: Number,
        default: 0
    },
    hidden: {
        type: Boolean,
        default: false, 
    }
}, {
    timestamps: true 
});

const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;
