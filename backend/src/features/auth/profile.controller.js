const User = require('./User.model');
const AppError = require('../../utils/AppError');

// Get current logged-in user profile
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, message: 'Profile fetched', data: user });
  } catch (err) { next(err); }
};

// Update name/email
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (err) { next(err); }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!user || !(await user.matchPassword(currentPassword))) {
      return next(new AppError('Current password is incorrect', 401));
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password changed successfully', data: {} });
  } catch (err) { next(err); }
};
