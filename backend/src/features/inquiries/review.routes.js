const express = require('express');
const { getCarReviews, addReview, approveReview, getPendingReviews, deleteReview } = require('./review.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/cars/:carId/reviews', getCarReviews);

// Protected routes
router.use(protect);
router.post('/cars/:carId/reviews', addReview);

// Admin routes
router.get('/reviews/pending', authorize('Admin'), getPendingReviews);
router.patch('/reviews/:id/approve', authorize('Admin'), approveReview);
router.delete('/reviews/:id', authorize('Admin'), deleteReview);

module.exports = router;
