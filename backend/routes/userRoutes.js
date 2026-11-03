const express = require('express');
const router = express.Router();
const { createUser, getUsers } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createUser);
router.get('/', getUsers);

module.exports = router;