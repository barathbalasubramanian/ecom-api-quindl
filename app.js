const express = require('express');
const { 
    createOrder, 
    getOrderById, 
    updateOrderToPaid, 
    updateOrderToDelivered, 
    getAllOrders,
    refundOrderItem,
    updateShippingStatus
} = require('../controllers/OrderController');

const router = express.Router();

// Order routes
router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/pay', updateOrderToPaid);
router.put('/:id/deliver', updateOrderToDelivered);
router.put('/:id/shipping-status', updateShippingStatus);

// Order item routes
router.put('/items/:itemId/refund', refundOrderItem);

module.exports = router;
