const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
    try {
        const categoryExists = await Category.findOne({ categoryName: req.body.categoryName });
        if (categoryExists) {
            return res.status(400).json({ error: 'Category already exists' });
        }
        const category = new Category(req.body);
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isDeleted: false });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}