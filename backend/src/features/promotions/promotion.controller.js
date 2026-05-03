const Promotion = require('./Promotion.model');
const { z } = require('zod');
const AppError = require('../../utils/AppError');

const promotionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  code: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.coerce.number(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  isActive: z.coerce.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.discountType === 'percentage' && (data.discountValue < 0 || data.discountValue > 10)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Percentage discount must be between 0 and 10',
      path: ['discountValue']
    });
  }
});

exports.getAllPromotions = async (req, res, next) => {
  try {
    const promotions = await Promotion.find({ isActive: true });
    res.status(200).json({ success: true, message: 'Promotions fetched successfully', data: promotions });
  } catch (err) { next(err); }
};

exports.createPromotion = async (req, res, next) => {
  try {
    const validatedData = promotionSchema.parse(req.body);
    
    if (req.file) {
      validatedData.bannerImage = `/uploads/cars/${req.file.filename}`;
    }

    const promotion = await Promotion.create(validatedData);
    res.status(201).json({ success: true, message: 'Promotion created successfully', data: promotion });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError(err.errors[0].message, 400));
    }
    next(err); 
  }
};

exports.verifyPromoCode = async (req, res, next) => {
  try {
    const { code } = req.body;
    const promo = await Promotion.findOne({ code: code.toUpperCase(), isActive: true });
    if (!promo || promo.endDate < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired promo code' });
    }
    res.status(200).json({ success: true, message: 'Promo code verified successfully', data: promo });
  } catch (err) { next(err); }
};

exports.updatePromotion = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.bannerImage = `/uploads/cars/${req.file.filename}`;
    }

    const promo = await Promotion.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!promo) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }
    res.status(200).json({ success: true, message: 'Promotion updated successfully', data: promo });
  } catch (err) {
    next(err); 
  }
};

exports.deletePromotion = async (req, res, next) => {
  try {
    const promo = await Promotion.findByIdAndDelete(req.params.id);
    if (!promo) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }
    res.status(200).json({ success: true, message: 'Promotion deleted successfully', data: {} });
  } catch (err) { next(err); }
};
