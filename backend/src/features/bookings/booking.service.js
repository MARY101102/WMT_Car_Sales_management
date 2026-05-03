const Booking = require('./Booking.model');
const Car = require('../cars/Car.model');
const AppError = require('../../utils/AppError');

exports.createBooking = async (bookingData) => {
  const { car, date, timeSlot } = bookingData;

  // Check if car exists
  const carExists = await Car.findById(car);
  if (!carExists) {
    throw new AppError('Car not found', 404);
  }

  // Check for double booking
  const existingBooking = await Booking.findOne({ car, date, timeSlot, status: { $ne: 'Cancelled' } });
  if (existingBooking) {
    throw new AppError('This time slot is already booked for this car', 400);
  }

  const booking = await Booking.create(bookingData);
  return booking;
};

exports.getUserBookings = async (userId) => {
  const bookings = await Booking.find({ user: userId }).populate({
    path: 'car',
    select: 'brand model year price mainImage status'
  }).sort('-createdAt');
  return bookings;
};

exports.getAllBookings = async () => {
  const bookings = await Booking.find().populate({
    path: 'car',
    select: 'brand model year price mainImage status'
  }).populate({
    path: 'user',
    select: 'name email'
  }).sort('-createdAt');
  return bookings;
};

exports.updateBookingStatus = async (id, status) => {
  const booking = await Booking.findByIdAndUpdate(id, { status }, {
    new: true,
    runValidators: true
  });
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }
  return booking;
};

exports.cancelBooking = async (id, userId, role) => {
  const booking = await Booking.findById(id);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  // Check ownership unless Admin/Staff
  if (booking.user.toString() !== userId.toString() && !['Admin', 'Staff'].includes(role)) {
    throw new AppError('Not authorized to cancel this booking', 403);
  }

  booking.status = 'Cancelled';
  await booking.save();
  return booking;
};
