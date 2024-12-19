const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const albumController = require('../controllers/album');

//routes
router.get('/', authMiddleware, albumController.getAlbums)
router.get('/:id', authMiddleware, albumController.getAlbumById)
router.post('/add-album', authMiddleware, albumController.addAlbum)
router.put('/:id', authMiddleware, albumController.updateAlbum)
router.delete('/:id', authMiddleware, albumController.deleteAlbum)

module.exports = router;