const express = require('express');
const usersController = require('../controllers/usersController');
const verifyJWT = require('../middleware/verifyJWT');
const router = express.Router();

router.post('/', usersController.signUp);

router.use(verifyJWT); // Protect all routes below this

router.get('/:id', usersController.getUser);
router.patch('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

module.exports = router;
