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
    },
    albums: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Album' 
    }],
    tracks: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Track' 
    }]
}, {
    timestamps: true 
});

const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;
