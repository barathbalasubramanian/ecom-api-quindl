const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

exports.createOrder = async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    try {
        // Transform order items to match schema
        const orderItemsToCreate = orderItems.map(item => ({
            product: item.product, // Assuming this is the product ID
            name: item.name,
            qty: item.qty,
            price: item.price,
            image: item.image
        }));

        // Create order items
        const createdOrderItems = await OrderItem.insertMany(orderItemsToCreate);

        // Create the order
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
            shippingStatus: 'Processing', // Default status
            isPaid: paymentMethod === 'online', // Set paid true if online payment
            paidAt: paymentMethod === 'online' ? Date.now() : null
        });

        const createdOrder = await order.save();

        // Populate order items for response
        const populatedOrder = await Order.findById(createdOrder._id)
            .populate('orderItems');

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
            .populate('orderItems');
        
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
        order.shippingStatus = 'Confirmed';

        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
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
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('orderItems')
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

        // Update parent order's shipping status
        const order = await Order.findOne({ orderItems: req.params.itemId });
        if (order) {
            order.shippingStatus = 'Refunded';
            await order.save();
        }

        res.status(200).json(updatedOrderItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
