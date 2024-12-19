const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Track = require('../models/track')
const trackController = require('../controllers/tracks')

//routes
router.get('/', authMiddleware, trackController.getTracks);
router.get('/:id', authMiddleware, trackController.getTrackById);
router.post('/add-track', authMiddleware, trackController.addTrack);
router.put('/:id', authMiddleware, trackController.updateTrack);
router.delete('/:id', authMiddleware, trackController.deleteTrackById);

module.exports = router;