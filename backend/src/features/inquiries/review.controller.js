const Review = require('./Review.model');

exports.getCarReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ car: req.params.carId, isApproved: true }).populate('user', 'name');
    res.status(200).json({ success: true, message: 'Reviews fetched successfully', data: reviews });
  } catch (err) { next(err); }
};

exports.addReview = async (req, res, next) => {
  try {
    const reviewData = { ...req.body, user: req.user.id, car: req.params.carId };
    const review = await Review.create(reviewData);
    res.status(201).json({ success: true, message: 'Review submitted and pending approval', data: review });
  } catch (err) { next(err); }
};

exports.approveReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.status(200).json({ success: true, message: 'Review approved successfully', data: review });
  } catch (err) { next(err); }
};

exports.getPendingReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ isApproved: false }).populate('user', 'name').populate('car', 'brand model');
    res.status(200).json({ success: true, message: 'Pending reviews fetched', data: reviews });
  } catch (err) { next(err); }
};

exports.deleteReview = async (req, res, next) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Review deleted successfully', data: {} });
  } catch (err) { next(err); }
};
