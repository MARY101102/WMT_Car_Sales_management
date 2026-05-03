const mongoose = require('mongoose');

const sparePartSchema = new mongoose.Schema({
  partName: {
    type: String,
    required: [true, 'Please provide a part name'],
    minlength: [3, 'Part name must be at least 3 characters'],
    maxlength: [150, 'Part name cannot exceed 150 characters'],
    trim: true
  },
  partNumber: {
    type: String,
    required: [true, 'Please provide a part number'],
    unique: true,
    trim: true,
    match: [/^[a-zA-Z0-9_-]+$/, 'Part number can only contain alphanumeric characters, hyphens, and underscores']
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Please provide a brand'],
    trim: true
  },
  category: {
    type: [String],
    required: [true, 'Please provide at least one category'],
    validate: [v => Array.isArray(v) && v.length > 0, 'At least one category is required']
  },
  salePrice: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0.01, 'Price must be greater than 0']
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    min: [0, 'Stock quantity cannot be negative'],
    default: 0
  },
  image: {
    type: String, // Storing URL
    default: 'https://via.placeholder.com/400'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
    required: true
  },
  metaTitle: {
    type: String,
    maxlength: [60, 'Meta title cannot exceed 60 characters'],
    trim: true
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot exceed 160 characters'],
    trim: true
  },
  shortDescription: {
    type: String,
    trim: true
  },
  specifications: [{
    key: String,
    value: String
  }],
  compatibility: {
    type: [String],
    default: []
  },
  weight: {
    type: Number, // In kg or grams
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  tags: {
    type: [String],
    default: []
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create index for search
sparePartSchema.index({ partName: 'text', partNumber: 'text', brand: 'text' });

module.exports = mongoose.model('SparePart', sparePartSchema);
