const carService = require('./car.service');
const { z } = require('zod');
const AppError = require('../../utils/AppError');

const carSchema = z.object({
  brand: z.string().min(1, 'Please add a car brand'),
  model: z.string().min(1, 'Please add a car model'),
  year: z.coerce.number().min(1886, 'Please add a valid year'),
  price: z.coerce.number().min(1000000, 'Price must be at least 1,000,000'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1').optional(),
  mileage: z.coerce.number(),
  fuelType: z.enum(['Petrol', 'Diesel', 'Electric', 'Hybrid']),
  transmission: z.enum(['Manual', 'Automatic']),
  condition: z.enum(['New', 'Used']),
  description: z.string().min(1, 'Please add a description'),
  location: z.string().optional(),
  status: z.enum(['Available', 'Sold', 'Unavailable']).optional(),
  category: z.enum(['SUV', 'Sedan', 'Hatchback', 'Luxury', 'Electric', 'Other']),
  featured: z.coerce.boolean().optional(),
  mainImage: z.string().min(1, 'Please add a main image').optional(),
  images: z.array(z.string()).optional()
});

exports.getCars = async (req, res, next) => {
  try {
    const result = await carService.getAllCars(req.query);
    res.status(200).json({
      success: true,
      message: 'Cars fetched successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getCar = async (req, res, next) => {
  try {
    const result = await carService.getCarById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Car fetched successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.createCar = async (req, res, next) => {
  try {
    const carData = { ...req.body };
    
    // Validate input data
    const validatedData = carSchema.parse(carData);
    
    // Add images if uploaded
    if (req.files) {
      if (req.files.mainImage && req.files.mainImage.length > 0) {
        validatedData.mainImage = `/uploads/cars/${req.files.mainImage[0].filename}`;
      } else {
        // Only throw error for mainImage on creation if missing in req body too.
        // Handled by mongoose if needed, but normally frontend sends it.
      }
      if (req.files.images && req.files.images.length > 0) {
        validatedData.images = req.files.images.map(img => `/uploads/cars/${img.filename}`);
      }
    }

    const result = await carService.createCar(validatedData);
    res.status(201).json({
      success: true,
      message: 'Car created successfully',
      data: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

exports.updateCar = async (req, res, next) => {
  try {
    const carData = { ...req.body };
    
    // Partial validation for updates
    const validatedData = carSchema.partial().parse(carData);
    
    // Update images if uploaded
    if (req.files) {
      if (req.files.mainImage && req.files.mainImage.length > 0) {
        validatedData.mainImage = `/uploads/cars/${req.files.mainImage[0].filename}`;
      }
      if (req.files.images && req.files.images.length > 0) {
        validatedData.images = req.files.images.map(img => `/uploads/cars/${img.filename}`);
      }
    }

    const result = await carService.updateCar(req.params.id, validatedData);
    res.status(200).json({
      success: true,
      message: 'Car updated successfully',
      data: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

exports.deleteCar = async (req, res, next) => {
  try {
    await carService.deleteCar(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Car deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
