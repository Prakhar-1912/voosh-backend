// routes/index.js
const express = require('express');
const authRoutes = require('./auth.routes');
const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({ message: 'API is up and running!' });
});

// Auth routes
router.use('/auth', authRoutes);


// Handle 404 errors for unknown routes
router.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

module.exports = router;
