const bookingService = require('./booking.service');

exports.createBooking = async (req, res, next) => {
  try {
    const bookingData = {
      ...req.body,
      user: req.user.id
    };
    
    const result = await bookingService.createBooking(bookingData);
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getUserBookings(req.user.id);
    res.status(200).json({
      success: true,
      message: 'My bookings fetched successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getAllBookings();
    res.status(200).json({
      success: true,
      message: 'All bookings fetched successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const result = await bookingService.updateBookingStatus(req.params.id, status);
    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const result = await bookingService.cancelBooking(req.params.id, req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
