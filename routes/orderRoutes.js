const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    updateOrderPayment, 
    getOrderById, 
    updateOrderToPaid,
    updateOrderStatus,
    getAllOrders, 
    refundOrderItem 
} = require('../controllers/OrderController');

router.post('/', createOrder);
router.put('/:orderId/payment', updateOrderPayment);
router.get('/:id', getOrderById);
router.put('/:id/pay', updateOrderToPaid);
router.put('/:id/status', updateOrderStatus);
router.get('/', getAllOrders);
router.post('/items/:itemId/refund', refundOrderItem);

module.exports = router;
