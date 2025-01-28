const express = require('express');
const { createOrder, getOrderById, updateOrderToPaid, updateOrderToDelivered, getMyOrders, getAllOrders } = require('../controllers/OrderController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, updateOrderToPaid);
router.put('/:id/deliver', protect, updateOrderToDelivered);
router.get('/', protect, getAllOrders);

module.exports = router;