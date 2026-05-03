const ordersService = require('./orders.service');

exports.createOrder = async (req, res, next) => {
  try {
    const order = await ordersService.createOrder(req.user.id, req.body);
    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await ordersService.getOrderById(req.params.id);
    
    // Check if user is admin or the order belongs to user
    if (order.user.id !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await ordersService.getMyOrders(req.user.id);
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await ordersService.getAllOrders();
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderToPaid = async (req, res, next) => {
  try {
    const order = await ordersService.updateOrderToPaid(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderToDelivered = async (req, res, next) => {
  try {
    const order = await ordersService.updateOrderToDelivered(req.params.id);
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};
