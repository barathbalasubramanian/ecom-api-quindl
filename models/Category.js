const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
    categoryName: { type: String, required: true },
    categoryType: { type: String, required: true,
        enum: ['Saree', 'Others'],
    },
    categotyImage: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
});
module.exports = mongoose.model('Category', categorySchema);