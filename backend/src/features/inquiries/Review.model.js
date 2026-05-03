const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  isApproved: {
    type: Boolean,
    default: false // Admin must approve
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
