const Coupon = require('../models/Coupon');

exports.createCoupon = async (req, res) => {
    const { name, type, typeValue, timeDuration, productIds } = req.body;

    try {
        const coupon = new Coupon({
            name,
            type,
            typeValue,
            timeDuration,
            productIds
        });

        const createdCoupon = await coupon.save();
        res.status(201).json(createdCoupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({});
        res.status(200).json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCouponById = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        res.status(200).json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateCoupon = async (req, res) => {
    const { name, type, typeValue, timeDuration, productIds } = req.body;

    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        coupon.name = name || coupon.name;
        coupon.type = type || coupon.type;
        coupon.typeValue = typeValue || coupon.typeValue;
        coupon.timeDuration = timeDuration || coupon.timeDuration;
        coupon.productIds = productIds || coupon.productIds;

        const updatedCoupon = await coupon.save();
        res.status(200).json(updatedCoupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        await coupon.remove();
        res.status(200).json({ message: 'Coupon removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};