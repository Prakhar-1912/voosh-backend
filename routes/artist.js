const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const artist = require('../models/artist')
const artistController = require('../controllers/artist')

//routes
router.post('/', authMiddleware, artistController.getArtists)

module.exports = router;