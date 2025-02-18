const express = require('express');
const { createOrder, getOrderById, updateOrderToPaid, updateOrderToDelivered, getAllOrders } = require('../controllers/OrderController');

const router = express.Router();

router.post('/', createOrder);
router.get('/:id', getOrderById);
router.put('/:id/pay', updateOrderToPaid);
router.put('/:id/deliver', updateOrderToDelivered);
router.post('/:orderId/items/:itemId/refund', refundOrderItem);
router.get('/', getAllOrders);

module.exports = router;
