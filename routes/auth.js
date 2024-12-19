// routes/auth.js (Updated)
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');

//routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authMiddleware, authController.logout);


module.exports = router;
