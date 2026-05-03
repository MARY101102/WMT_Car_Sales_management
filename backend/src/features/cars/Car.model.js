const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: [true, 'Please add a car brand'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Please add a car model'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Please add a car year']
  },
  price: {
    type: Number,
    required: [true, 'Please add a car price'],
    min: [1000000, 'Price must be at least 1,000,000']
  },
  quantity: {
    type: Number,
    required: [true, 'Please add quantity'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  mileage: {
    type: Number,
    required: [true, 'Please add mileage']
  },
  fuelType: {
    type: String,
    required: [true, 'Please add fuel type'],
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid']
  },
  transmission: {
    type: String,
    required: [true, 'Please add transmission type'],
    enum: ['Manual', 'Automatic']
  },
  condition: {
    type: String,
    required: [true, 'Please add condition'],
    enum: ['New', 'Used']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  location: {
    type: String,
    default: 'Main Showroom'
  },
  images: {
    type: [String],
    default: []
  },
  mainImage: {
    type: String,
    required: [true, 'Please add a main image']
  },
  status: {
    type: String,
    enum: ['Available', 'Sold', 'Unavailable'],
    default: 'Available'
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['SUV', 'Sedan', 'Hatchback', 'Luxury', 'Electric', 'Other']
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for search and filtering
carSchema.index({ brand: 'text', model: 'text', description: 'text' });
carSchema.index({ price: 1, year: -1 });

module.exports = mongoose.model('Car', carSchema);
