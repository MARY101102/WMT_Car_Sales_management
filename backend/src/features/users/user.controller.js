const User = require('../auth/User.model');
const AppError = require('../../utils/AppError');

// Admin creates a Staff account
exports.createStaff = async (req, res, next) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    if (!name || !email || !password || !phoneNumber) {
      return next(new AppError('Please provide name, email, password, and phoneNumber', 400));
    }
    const exists = await User.findOne({ email });
    if (exists) return next(new AppError('Email already in use', 400));

    const staff = await User.create({ name, email, password, phoneNumber, role: 'Staff' });
    res.status(201).json({
      success: true,
      message: 'Staff account created successfully',
      data: { id: staff._id, name: staff.name, email: staff.email, role: staff.role }
    });
  } catch (err) { next(err); }
};

// Update user role (Admin)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
    if (!user) return next(new AppError('User not found', 404));
    res.status(200).json({ success: true, message: 'User role updated successfully', data: user });
  } catch (err) { next(err); }
};

// Delete user (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    res.status(200).json({ success: true, message: 'User deleted successfully', data: {} });
  } catch (err) { next(err); }
};

// Get all users (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password -refreshToken').sort('-createdAt');
    res.status(200).json({ success: true, data: users });
  } catch (err) { next(err); }
};
