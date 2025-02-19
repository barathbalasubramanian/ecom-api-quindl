const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

exports.createOrder = async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    try {
        const Product = require('../models/Product');
        
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ 
                    message: `Product not found: ${item.product}` 
                });
            }
            if (product.stock < item.qty) {
                return res.status(400).json({ 
                    message: `Insufficient stock for product: ${product.productName}. Available: ${product.stock}, Requested: ${item.qty}` 
                });
            }
        }

        const createdOrderItems = [];
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            product.stock -= item.qty;
            await product.save();

            const orderItem = await OrderItem.create({
                product: item.product,
                name: item.name,
                qty: item.qty,
                price: item.price,
                image: item.image
            });
            createdOrderItems.push(orderItem);
        }

        const order = new Order({
            orderItems: createdOrderItems.map(item => item._id),
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.restoreStock = async (orderId) => {
    try {
        const order = await Order.findById(orderId).populate('orderItems');
        const Product = require('../models/Product');

        for (const orderItem of order.orderItems) {
            const product = await Product.findById(orderItem.product);
            if (product) {
                product.stock += orderItem.qty;
                await product.save();
            }
        }
    } catch (error) {
        console.error('Error restoring stock:', error);
        throw error;
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('orderItems');
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

        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('orderItems');
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

        res.status(200).json(updatedOrderItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateShippingStatus = async (req, res) => {
    const { shippingStatus } = req.body;

    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.shippingStatus = shippingStatus;
        const updatedOrder = await order.save();

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
