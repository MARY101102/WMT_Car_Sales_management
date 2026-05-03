const express = require('express');
const { createInquiry, getMyInquiries, getAllInquiries, respondToInquiry, updateInquiry, deleteInquiry } = require('./inquiry.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Customer routes
router.post('/', createInquiry);
router.get('/my', getMyInquiries);
router.put('/:id', updateInquiry);

// Admin/Staff routes
router.get('/all', authorize('Admin', 'Staff'), getAllInquiries);
router.patch('/:id/respond', authorize('Admin', 'Staff'), respondToInquiry);
router.delete('/:id', authorize('Admin', 'Staff'), deleteInquiry);

module.exports = router;
