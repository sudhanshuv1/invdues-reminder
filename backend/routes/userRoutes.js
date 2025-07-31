const express = require('express');
const usersController = require('../controllers/usersController');
const verifyJWT = require('../middleware/verifyJWT');
const router = express.Router();

router.post('/', usersController.signUp);

router.use(verifyJWT); // Protect all routes below this

// Profile management routes
router.get('/profile', usersController.getUserProfile);
router.patch('/profile', usersController.updateUserProfile);
router.patch('/change-password', usersController.changePassword);
router.delete('/account', usersController.deleteUserAccount);
router.get('/stats', usersController.getUserStats);

// Legacy routes (keep for backward compatibility)
router.get('/:id', usersController.getUser);
router.patch('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

module.exports = router;
