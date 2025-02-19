const express = require('express');
const router = express.Router();
const { createOrder, updateOrderPayment, getOrderById, updateOrderToDelivered, getAllOrders, refundOrderItem } = require('../controllers/OrderController');

router.post('/', createOrder);
router.put('/:orderId/payment', updateOrderPayment);
router.get('/:id', getOrderById);
router.put('/:id/deliver', updateOrderToDelivered);
router.get('/', getAllOrders);
router.post('/:orderId/items/:itemId/refund', refundOrderItem);

module.exports = router;
