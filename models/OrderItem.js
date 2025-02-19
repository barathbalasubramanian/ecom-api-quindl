const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: '' },
    refunded: { type: Boolean, default: false },
    refundAmount: { type: Number, default: 0 }
});

module.exports = mongoose.model('OrderItem', orderItemSchema);
