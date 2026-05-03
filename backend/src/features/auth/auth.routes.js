const express = require('express');
const { register, login, refreshToken, logout } = require('./auth.controller');
const { getMe, updateProfile, changePassword } = require('./profile.controller');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
// Protected routes
router.use(protect);
router.post('/logout', logout);
router.get('/me', getMe);
router.patch('/update-profile', updateProfile);
router.patch('/change-password', changePassword);

module.exports = router;
