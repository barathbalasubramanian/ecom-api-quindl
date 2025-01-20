const Variant = require('../models/Variant');

exports.createVariant = async (req, res) => {
    try {
        const variantExists = await Variant.findOne({ variantName: req.body.name });
        if (variantExists) {
            return res.status(400).json({ error: 'Variant already exists' });
        }
        const variant = new Variant(req.body);
        await variant.save();
        res.status(201).json(variant);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getVariants = async (req, res) => {
    try {
        const variants = await Variant.find({ isDeleted: false });
        res.status(200).json(variants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getVariant = async (req, res) => {
    try {
        const variant = await Variant.findById(req.params.id);
        if (!variant) {
            return res.status(404).json({ error: 'Variant not found' });
        }
        res.status(200).json(variant);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.updateVariant = async (req, res) => {
    try {
        const variant = await Variant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!variant) {
            return res.status(404).json({ error: 'Variant not found' });
        }
        res.status(200).json(variant);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}