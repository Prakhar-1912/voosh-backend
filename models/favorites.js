const mongoose = require('mongoose');

const favoritesSchema = new mongoose.Schema({
    favorite_id: {
        type: String, // UUID as a string
        required: true,
        unique: true,
    }
}, {
    timestamps: true
});

// Create the Favorites model
const Favorites = mongoose.model('Favorites', favoritesSchema);
module.exports = Favorites;