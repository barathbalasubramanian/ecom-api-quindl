const mongoose = require('mongoose');
const variantSchema = new mongoose.Schema({
    variantName: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
});
module.exports = mongoose.model('Variant', variantSchema);