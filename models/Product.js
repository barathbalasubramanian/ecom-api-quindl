const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    categoryName: { type: String, required: true },
    variantName: { type: String },
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant' },
    description: { type: String },
    stock: { type: Number, required: true },
    actualPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    tags: [{ type: String }],
    tax: { type: Number },
    couponCode: { type: String },
    couponMethod: { type: String },
    color: { type: String },
    isDeleted: { type: Boolean, default: false },
});
module.exports = mongoose.model('Product', productSchema);