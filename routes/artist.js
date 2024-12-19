const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const artistController = require('../controllers/artist')

//routes
router.get('/', authMiddleware, artistController.getArtists)
router.get('/:id', authMiddleware, artistController.getArtistById)
router.post('/add-artist', authMiddleware, artistController.addArtist)
router.put('/:id', authMiddleware, artistController.updateArtist)
router.delete('/:id', authMiddleware, artistController.deleteArtist)

module.exports = router;