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

        const orderItemsData = await Promise.all(orderItems.map(async item => {
            const orderItem = new OrderItem({
                product: item.product,
                name: item.name,
                qty: item.qty,
                price: item.price,
                image: item.image || ''
            });
            return await orderItem.save();
        }));

        const order = new Order({
            orderItems: orderItemsData.map(item => item._id),
            shippingAddress: {
                firstName: shippingAddress.firstName,
                lastName: shippingAddress.lastName,
                email: shippingAddress.email,
                addressLine1: shippingAddress.addressLine1,
                addressLine2: shippingAddress.addressLine2 || '',
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
            isPaid: paymentMethod === 'COD' ? false : false,
            orderStatus: 'Pending'
        });

        const createdOrder = await order.save();

        if (paymentMethod.toLowerCase() === 'online') {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(totalPrice * 100),
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
        res.json(updatedOrder);

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
        order.orderStatus = 'Processing';
        
        const updatedOrder = await order.save();
        
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
        await orderItem.save();

        const order = await Order.findOne({ orderItems: req.params.itemId });
        if (order) {
            order.orderStatus = 'Cancelled';
            await order.save();
        }

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

module.exports = exports;
