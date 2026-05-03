const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  car: {
    type: mongoose.Schema.ObjectId,
    ref: 'Car',
    required: true
  },
  type: {
    type: String,
    enum: ['TestDrive', 'Reservation'],
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please add a booking date']
  },
  timeSlot: {
    type: String,
    required: [true, 'Please add a time slot (e.g., 10:00 AM)']
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Prevent double booking for the same car at the same date and time slot
bookingSchema.index({ car: 1, date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
