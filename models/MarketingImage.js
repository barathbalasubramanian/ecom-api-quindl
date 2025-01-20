const express = require('express');
const marketingImageSchema = new mongoose.Schema({
    image: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
});
module.exports = mongoose.model('MarketingImage', marketingImageSchema);