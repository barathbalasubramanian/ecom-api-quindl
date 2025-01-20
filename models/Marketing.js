const mongoose = require('mongoose');
const marketingContentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
});
module.exports = mongoose.model('MarketingContent', marketingContentSchema);