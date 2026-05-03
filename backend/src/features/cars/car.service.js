const Car = require('./Car.model');
const AppError = require('../../utils/AppError');

exports.getAllCars = async (query) => {
  // Filtering
  const queryObj = { ...query };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
  excludedFields.forEach(el => delete queryObj[el]);

  // Advanced filtering for price, year (e.g. price[gte]=10000)
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  
  let mongooseQuery = Car.find(JSON.parse(queryStr));

  // Search
  if (query.search) {
    mongooseQuery = mongooseQuery.find({ $text: { $search: query.search } });
  }

  // Sorting
  if (query.sort) {
    const sortBy = query.sort.split(',').join(' ');
    mongooseQuery = mongooseQuery.sort(sortBy);
  } else {
    mongooseQuery = mongooseQuery.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  mongooseQuery = mongooseQuery.skip(skip).limit(limit);

  const cars = await mongooseQuery;
  const total = await Car.countDocuments(JSON.parse(queryStr));

  return {
    cars,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

exports.getCarById = async (id) => {
  const car = await Car.findById(id);
  if (!car) {
    throw new AppError('Car not found', 404);
  }
  return car;
};

exports.createCar = async (carData) => {
  const car = await Car.create(carData);
  return car;
};

exports.updateCar = async (id, carData) => {
  const car = await Car.findByIdAndUpdate(id, carData, {
    new: true,
    runValidators: true
  });
  if (!car) {
    throw new AppError('Car not found', 404);
  }
  return car;
};

exports.deleteCar = async (id) => {
  const car = await Car.findByIdAndDelete(id);
  if (!car) {
    throw new AppError('Car not found', 404);
  }
  return null;
};
