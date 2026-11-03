const express = require('express');
const router = express.Router();
const { updateProfile, updatePassword } = require('../controllers/settingsController');
const protect = require('../middleware/authMiddleware');

// both routes protected — must be logged in
router.patch('/profile', protect, updateProfile);
router.patch('/password', protect, updatePassword);

module.exports = router;