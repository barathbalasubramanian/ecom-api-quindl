const orderSchema = new mongoose.Schema({
    orderItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem', required: true }],
    shippingAddress: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        addressLine1: { type: String, required: true },
        addressLine2: { type: String },
        city: { type: String, required: true },
        pincode: { type: String, required: true },
        state: { type: String, required: true },
        phoneNumber: { type: String, required: true }
    },
    paymentMethod: { type: String, required: true },
    paymentResult: {id: { type: String },status: { type: String },update_time: { type: String },email_address: { type: String } },
    itemsPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    orderStatus: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
