const Inquiry = require('./Inquiry.model');
const AppError = require('../../utils/AppError');
const { z } = require('zod');

const inquirySchema = z.object({
  subject: z.string().min(1, 'Please add a subject'),
  message: z.string().min(1, 'Please add a message'),
  customerName: z.string().min(1, 'Please add a customer name'),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  invoiceNumber: z.string().regex(/^INV-\d{4}$/, 'Invoice number must be in format INV-XXXX').optional().or(z.literal(''))
});

// Customer submits an inquiry
exports.createInquiry = async (req, res, next) => {
  try {
    const validatedData = inquirySchema.parse(req.body);

    const inquiry = await Inquiry.create({
      ...validatedData,
      user: req.user.id
    });
    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: inquiry
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError(err.errors[0].message, 400));
    }
    next(err); 
  }
};

// Customer gets their own inquiries
exports.getMyInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      message: 'Inquiries fetched successfully',
      data: inquiries
    });
  } catch (err) { next(err); }
};

// Admin/Staff gets all inquiries
exports.getAllInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find().populate('user', 'name email').sort('-createdAt');
    res.status(200).json({
      success: true,
      message: 'All inquiries fetched successfully',
      data: inquiries
    });
  } catch (err) { next(err); }
};

// Admin/Staff responds to an inquiry
exports.respondToInquiry = async (req, res, next) => {
  try {
    const { response, status } = req.body;
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      {
        response,
        status: status || 'Resolved',
        respondedBy: req.user.id,
        respondedAt: Date.now()
      },
      { new: true }
    );
    if (!inquiry) return next(new AppError('Inquiry not found', 404));

    res.status(200).json({
      success: true,
      message: 'Response sent successfully',
      data: inquiry
    });
  } catch (err) { next(err); }
};

// Customer updates their pending inquiry
exports.updateInquiry = async (req, res, next) => {
  try {
    const validatedData = inquirySchema.partial().parse(req.body);
    const inquiry = await Inquiry.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!inquiry) return next(new AppError('Inquiry not found', 404));
    if (inquiry.status !== 'Pending') return next(new AppError('You can only edit pending inquiries', 400));

    Object.assign(inquiry, validatedData);
    await inquiry.save();

    res.status(200).json({ success: true, message: 'Inquiry updated successfully', data: inquiry });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(err.errors[0].message, 400));
    next(err); 
  }
};

// Admin deletes an inquiry
exports.deleteInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) return next(new AppError('Inquiry not found', 404));
    res.status(200).json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (err) { next(err); }
};
