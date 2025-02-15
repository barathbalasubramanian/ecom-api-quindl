const express = require('express');
const mongoose = require('mongoose');

const marketingImageSchema = new mongoose.Schema({
    imageUrls: [{ type: String, required: true }],
    isDeleted: { type: Boolean, default: false },
});
module.exports = mongoose.model('MarketingImage', marketingImageSchema);