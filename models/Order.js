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
    paymentMethod: { type: String, required: true, default: 'COD' },
    itemsPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
    isPaid: { type: Boolean, default: false },
    shippingStatus: { type: String, enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],default: 'Processing' },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});
