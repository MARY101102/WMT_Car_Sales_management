const sparePartsService = require('./spareParts.service');
const { z } = require('zod');
const AppError = require('../../utils/AppError');

// Basic Zod Schema for validation
const sparePartSchema = z.object({
  partName: z.string().min(3).max(150),
  partNumber: z.string().regex(/^[a-zA-Z0-9_-]+$/),
  slug: z.string().min(1),
  brand: z.string().min(1),
  category: z.array(z.string()).min(1),
  salePrice: z.number().positive(),
  stockQuantity: z.number().min(0),
  image: z.string().optional().nullable(),
  status: z.enum(['Active', 'Inactive']),
  metaTitle: z.string().max(60).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  compatibility: z.array(z.string()).optional(),
  weight: z.number().optional().nullable(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional()
}).passthrough(); // Allow extra fields like specifications and dimensions for now

exports.getAllSpareParts = async (req, res, next) => {
  try {
    const result = await sparePartsService.getAllSpareParts(req.query);
    res.status(200).json({
      success: true,
      data: result.spareParts,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getSparePart = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let sparePart;
    // Simple check if it's an object ID
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      sparePart = await sparePartsService.getSparePartById(idOrSlug);
    } else {
      sparePart = await sparePartsService.getSparePartBySlug(idOrSlug);
    }
    
    res.status(200).json({
      success: true,
      data: sparePart
    });
  } catch (error) {
    next(error);
  }
};

exports.createSparePart = async (req, res, next) => {
  try {
    const validatedData = sparePartSchema.parse(req.body);
    const sparePart = await sparePartsService.createSparePart(validatedData);
    
    res.status(201).json({
      success: true,
      data: sparePart
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    // Handle Mongoose duplicate key errors
    if (error.code === 11000) {
       return next(new AppError('Duplicate field value entered (partNumber or slug)', 400));
    }
    next(error);
  }
};

exports.updateSparePart = async (req, res, next) => {
  try {
    // We can use partial schema for updates
    const validatedData = sparePartSchema.partial().parse(req.body);
    const sparePart = await sparePartsService.updateSparePart(req.params.idOrSlug, validatedData);
    
    res.status(200).json({
      success: true,
      data: sparePart
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
     if (error.code === 11000) {
       return next(new AppError('Duplicate field value entered (partNumber or slug)', 400));
    }
    next(error);
  }
};

exports.deleteSparePart = async (req, res, next) => {
  try {
    await sparePartsService.deleteSparePart(req.params.idOrSlug);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
