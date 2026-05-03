const express = require('express');
const { createBooking, getMyBookings, getAllBookings, updateBookingStatus, cancelBooking } = require('./booking.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Customer routes
router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);
router.patch('/:id/cancel', cancelBooking);

// Admin/Staff routes
router.get('/', authorize('Admin', 'Staff'), getAllBookings);
router.patch('/:id/status', authorize('Admin', 'Staff'), updateBookingStatus);

module.exports = router;
