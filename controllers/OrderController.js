const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

        // Create order items with additional product details
        const orderItemsData = await Promise.all(orderItems.map(async item => {
            const orderItem = new OrderItem({
                product: item.product._id || item.product,
                name: item.name,
                qty: item.qty,
                price: item.price,
                image: item.image,
                variantName: item.variantName,
                variantId: item.variantId,
                color: item.color
            });
            return await orderItem.save();
        }));

        // Create the order with saved order items
        const order = new Order({
            orderItems: orderItemsData.map(item => item._id),
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            isPaid: false,
            orderStatus: 'Pending'
        });

        const createdOrder = await order.save();

        if (paymentMethod === 'online') {
            // Create Stripe payment intent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(totalPrice * 100), // Convert to cents
                currency: 'inr',
                metadata: {
                    orderId: createdOrder._id.toString()
                }
            });

            return res.status(201).json({
                success: true,
                order: createdOrder,
                clientSecret: paymentIntent.client_secret
            });
        }

        res.status(201).json({
            success: true,
            order: createdOrder
        });

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
};

exports.updateOrderPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentIntentId, paymentStatus } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.orderStatus = 'Processing';
        order.paymentResult = {
            id: paymentIntentId,
            status: paymentStatus,
            update_time: new Date().toISOString(),
            email_address: order.shippingAddress.email
        };

        const updatedOrder = await order.save();
        
        const populatedOrder = await Order.findById(updatedOrder._id)
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    model: 'Product',
                    select: 'productName productCode categoryName variantName color stock availability images'
                }
            });

        res.json(populatedOrder);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    model: 'Product',
                    select: 'productName productCode categoryName variantName color stock availability images'
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
        order.orderStatus = 'Processing';
        
        const updatedOrder = await order.save();
        
        const populatedOrder = await Order.findById(updatedOrder._id)
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    model: 'Product',
                    select: 'productName productCode categoryName variantName color stock availability images'
                }
            });

        res.status(200).json(populatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.orderStatus = orderStatus;

        if (orderStatus === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();
        
        const populatedOrder = await Order.findById(updatedOrder._id)
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    model: 'Product',
                    select: 'productName productCode categoryName variantName color stock availability images'
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
        order.orderStatus = 'Delivered';

        const updatedOrder = await order.save();
        
        const populatedOrder = await Order.findById(updatedOrder._id)
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    model: 'Product',
                    select: 'productName productCode categoryName variantName color stock availability images'
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
                    model: 'Product',
                    select: 'productName productCode categoryName variantName color stock availability images'
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

        const order = await Order.findOne({ orderItems: req.params.itemId });
        if (order) {
            order.orderStatus = 'Refunded';
            await order.save();
        }

        const populatedOrder = await Order.findById(order._id)
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    model: 'Product',
                    select: 'productName productCode categoryName variantName color stock availability images'
                }
            });

        res.status(200).json(populatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ 'user': req.user._id })
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    model: 'Product',
                    select: 'productName productCode categoryName variantName color stock availability images'
                }
            })
            .sort('-createdAt');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
