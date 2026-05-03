const express = require('express');
const { createStaff, getAllUsers, updateUserRole, deleteUser } = require('./user.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

const router = express.Router();
router.use(protect);
router.use(authorize('Admin'));

router.get('/', getAllUsers);
router.post('/create-staff', createStaff);
router.patch('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

module.exports = router;
