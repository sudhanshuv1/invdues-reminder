const express = require('express');
const profileController = require('../controllers/usersController');
const verifyJWT = require('../middleware/ensureAuth');
const router = express.Router();

router.use(ensureAuth); // Protect all routes below this

router.get('/:id', profileController.getUser);
router.patch('/:id', profileController.updateUser);
router.delete('/:id', profileController.deleteUser);

module.exports = router;
