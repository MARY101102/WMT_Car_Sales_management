const express = require('express');
const ordersController = require('./orders.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .post(ordersController.createOrder)
  .get(authorize('Admin', 'Staff'), ordersController.getAllOrders);

router.route('/myorders')
  .get(ordersController.getMyOrders);

router.route('/:id')
  .get(ordersController.getOrderById);

router.route('/:id/pay')
  .put(authorize('Admin', 'Staff'), ordersController.updateOrderToPaid);

router.route('/:id/deliver')
  .put(authorize('Admin', 'Staff'), ordersController.updateOrderToDelivered);

module.exports = router;
