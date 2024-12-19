const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const userController = require('../controllers/user')

//routes
router.get('/', authMiddleware, roleAuth(['admin']), userController.getAllUsers)
router.post('/add-user', authMiddleware, roleAuth(['admin']), userController.addUser)
router.post('/:id', authMiddleware, roleAuth(['admin']), userController.deleteUser)
router.put('/update-password', authMiddleware, userController.updatePassword)


module.exports = router;