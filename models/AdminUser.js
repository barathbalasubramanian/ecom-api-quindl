const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminUserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    permissions: {
        productManagement: { type: Boolean, default: false },
        orderManagement: { type: Boolean, default: false },
        customerManagement: { type: Boolean, default: false },
        categoryManagement: { type: Boolean, default: false },
        couponsManagement: { type: Boolean, default: false },
        inventoryManagement: { type: Boolean, default: false },
        analyticsManagement: { type: Boolean, default: false },
        marketingManagement: { type: Boolean, default: false }
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
});

adminUserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

adminUserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('AdminUser', adminUserSchema);
