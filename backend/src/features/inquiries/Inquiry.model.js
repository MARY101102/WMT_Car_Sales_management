const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String,
    required: [true, 'Please add a customer name']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  invoiceNumber: {
    type: String,
    match: [/^INV-\d{4}$/, 'Invoice number must be in format INV-XXXX']
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Please add a message']
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending'
  },
  response: {
    type: String
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  respondedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', InquirySchema);
