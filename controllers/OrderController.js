const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

exports.createOrder = async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    try {
        const orderItemsToCreate = orderItems.map(item => ({
            product: item.id,
            name: item.name,
            qty: item.quantity,
            price: parseInt(item.price.replace(/[^0-9]/g, "")),
            image: item.images[0]
        }));

        const createdOrderItems = await OrderItem.insertMany(orderItemsToCreate);

        const order = new Order({
            orderItems: createdOrderItems.map(item => item._id),
            shippingAddress: {
                firstName: shippingAddress.firstName,
                lastName: shippingAddress.lastName,
                email: shippingAddress.email,
                addressLine1: shippingAddress.addressLine1,
                addressLine2: shippingAddress.addressLine2,
                city: shippingAddress.city,
                pincode: shippingAddress.pincode,
                state: shippingAddress.state,
                phoneNumber: shippingAddress.phoneNumber
            },
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            shippingStatus: 'Processing',
            isPaid: paymentMethod === 'online',
            paidAt: paymentMethod === 'online' ? Date.now() : null
        });

        const createdOrder = await order.save();

        const populatedOrder = await Order.findById(createdOrder._id)
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    model: 'Product'
                }
            });

        res.status(201).json(populatedOrder);
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ 
            message: 'Failed to create order',
            error: error.message 
        });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    model: 'Product'
                }
            });
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        
        const updatedOrder = await order.save();
        
        // Populate order details before sending response
        const populatedOrder = await Order.findById(updatedOrder._id)
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    model: 'Product'
                }
            });

        res.status(200).json(populatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateShippingStatus = async (req, res) => {
    try {
        const { shippingStatus } = req.body;
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update shipping status
        order.shippingStatus = shippingStatus;

        // If status is Delivered, update isDelivered and deliveredAt
        if (shippingStatus === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();
        
        // Populate order details before sending response
        const populatedOrder = await Order.findById(updatedOrder._id)
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    model: 'Product'
                }
            });

        res.status(200).json(populatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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
        
        // Populate order details before sending response
        const populatedOrder = await Order.findById(updatedOrder._id)
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    model: 'Product'
                }
            });

        res.status(200).json(populatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    model: 'Product'
                }
            })
            .sort('-createdAt');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.refundOrderItem = async (req, res) => {
    const { refundAmount } = req.body;

    try {
        const orderItem = await OrderItem.findById(req.params.itemId);
        if (!orderItem) {
            return res.status(404).json({ message: 'Order item not found' });
        }

        orderItem.refunded = true;
        orderItem.refundAmount = refundAmount;
        const updatedOrderItem = await orderItem.save();

        // Find and update the parent order
        const order = await Order.findOne({ orderItems: req.params.itemId });
        if (order) {
            order.shippingStatus = 'Refunded';
            await order.save();
        }

        // Return the populated order for frontend state update
        const populatedOrder = await Order.findById(order._id)
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    model: 'Product'
                }
            });

        res.status(200).json(populatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
