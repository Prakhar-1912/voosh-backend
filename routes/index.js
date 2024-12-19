// routes/index.js
const express = require('express');
const authRoutes = require('./auth');
const artistRoutes = require('./artist');
const trackRoutes = require('./tracks');
const favoritesRoutes = require('./favorites');
const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({ message: 'API is up and running!' });
});

// Auth routes
router.use('/', authRoutes);
router.use('/artist', artistRoutes);
router.use('/tracks', trackRoutes);
router.use('/favorites', favoritesRoutes);

// Handle 404 errors for unknown routes
router.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

module.exports = router;
