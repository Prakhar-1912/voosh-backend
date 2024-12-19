const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Favorites = require('../models/favorites')
const favoritesController = require('../controllers/favorite')

//routes
router.get('/:category', authMiddleware, favoritesController.getFavoritesByCategory);
router.post('/add-favorite', authMiddleware, favoritesController.addFavorite);
router.delete('/remove-favorite/:id', authMiddleware, favoritesController.removeFavoriteById);

module.exports = router;