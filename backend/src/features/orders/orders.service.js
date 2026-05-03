const Order = require('./Order.model');
const AppError = require('../../utils/AppError');

exports.createOrder = async (userId, orderData) => {
  const { items, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = orderData;
  
  if (items && items.length === 0) {
    throw new AppError('No order items', 400);
  }

  const order = await Order.create({
    user: userId,
    items,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  });

  return order;
};

exports.getOrderById = async (id) => {
  const order = await Order.findById(id).populate('user', 'name email');
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  return order;
};

exports.getMyOrders = async (userId) => {
  const orders = await Order.find({ user: userId }).sort('-createdAt');
  return orders;
};

exports.getAllOrders = async () => {
  const orders = await Order.find().populate('user', 'id name').sort('-createdAt');
  return orders;
};

exports.updateOrderToPaid = async (id, paymentResult) => {
  const order = await Order.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  if (order.status === 'Pending') {
    order.status = 'Processing';
  }

  const updatedOrder = await order.save();
  return updatedOrder;
};

exports.updateOrderToDelivered = async (id) => {
  const order = await Order.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();
  order.status = 'Delivered';

  const updatedOrder = await order.save();
  return updatedOrder;
};
