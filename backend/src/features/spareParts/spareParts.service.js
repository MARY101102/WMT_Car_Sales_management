const SparePart = require('./SparePart.model');
const AppError = require('../../utils/AppError');

exports.getAllSpareParts = async (query) => {
  // Filtering
  const queryObj = { ...query, isDeleted: false };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
  excludedFields.forEach(el => delete queryObj[el]);

  // Handle Search
  if (query.search) {
    queryObj.$text = { $search: query.search };
  }

  // Handle price range if present
  if (queryObj.minPrice || queryObj.maxPrice) {
    queryObj.regularPrice = {};
    if (queryObj.minPrice) {
      queryObj.regularPrice.$gte = Number(queryObj.minPrice);
      delete queryObj.minPrice;
    }
    if (queryObj.maxPrice) {
      queryObj.regularPrice.$lte = Number(queryObj.maxPrice);
      delete queryObj.maxPrice;
    }
  }
  
  // Category filter
  if(queryObj.category) {
    queryObj.category = { $in: queryObj.category.split(',') };
  }

  let dbQuery = SparePart.find(queryObj);

  // Sorting
  if (query.sort) {
    const sortBy = query.sort.split(',').join(' ');
    dbQuery = dbQuery.sort(sortBy);
  } else {
    dbQuery = dbQuery.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  dbQuery = dbQuery.skip(skip).limit(limit);

  const spareParts = await dbQuery;
  const total = await SparePart.countDocuments(queryObj);

  return { spareParts, total, page, limit };
};

exports.getSparePartBySlug = async (slug) => {
  const sparePart = await SparePart.findOne({ slug, isDeleted: false });
  if (!sparePart) {
    throw new AppError('Spare part not found', 404);
  }
  return sparePart;
};

exports.getSparePartById = async (id) => {
  const sparePart = await SparePart.findOne({ _id: id, isDeleted: false });
  if (!sparePart) {
    throw new AppError('Spare part not found', 404);
  }
  return sparePart;
};

exports.createSparePart = async (data) => {
  return await SparePart.create(data);
};

exports.updateSparePart = async (id, data) => {
  const sparePart = await SparePart.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
  if (!sparePart) {
    throw new AppError('Spare part not found', 404);
  }
  return sparePart;
};

exports.deleteSparePart = async (id) => {
  const sparePart = await SparePart.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!sparePart) {
    throw new AppError('Spare part not found', 404);
  }
  return true;
};
