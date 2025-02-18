const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

// Create new order
exports.createOrder = async (req, res) => {
    try {
        const { 
            orderItems, 
            shippingAddress, 
            paymentMethod, 
            itemsPrice, 
            taxPrice, 
            shippingPrice, 
            totalPrice 
        } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items provided' });
        }

        // Create order items first
        const createdOrderItems = await OrderItem.insertMany(
            orderItems.map(item => ({
                product: item.product,
                name: item.name,
                qty: item.qty,
                price: item.price,
                image: item.image
            }))
        );

        // Create the order
        const order = new Order({
            orderItems: createdOrderItems.map(item => item._id),
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            shippingStatus: 'Processing'
        });

        const createdOrder = await order.save();

        // Populate order items for response
        const populatedOrder = await Order.findById(createdOrder._id)
            .populate('orderItems');

        res.status(201).json(populatedOrder);
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to create order', 
            error: error.message 
        });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('orderItems');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch order', 
            error: error.message 
        });
    }
};

// Update order payment status
exports.updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        
        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to update payment status', 
            error: error.message 
        });
    }
};

// Update order delivery status
exports.updateOrderToDelivered = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.shippingStatus = 'Delivered';
        
        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to update delivery status', 
            error: error.message 
        });
    }
};

// Process refund for order item
exports.refundOrderItem = async (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        const { refundAmount } = req.body;

        // Verify order exists
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify order is paid
        if (!order.isPaid) {
            return res.status(400).json({ message: 'Order is not paid yet' });
        }

        // Update order item
        const orderItem = await OrderItem.findById(itemId);
        if (!orderItem) {
            return res.status(404).json({ message: 'Order item not found' });
        }

        if (orderItem.refunded) {
            return res.status(400).json({ message: 'Item already refunded' });
        }

        orderItem.refunded = true;
        orderItem.refundAmount = refundAmount;
        await orderItem.save();

        // Return updated order with populated items
        const updatedOrder = await Order.findById(orderId)
            .populate('orderItems');

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to process refund', 
            error: error.message 
        });
    }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('orderItems')
            .sort({ createdAt: -1 });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch orders', 
            error: error.message 
        });
    }
};
