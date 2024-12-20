// models/Favorite.js
const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { 
        type: String, 
        required: true,
        enum: ['artist', 'album', 'track']
    },
    item_id: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate favorites
favoriteSchema.index({ user: 1, category: 1, item_id: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);