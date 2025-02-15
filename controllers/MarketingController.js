const MarketingContent = require("../models/Marketing");
const MarketingImage = require("../models/MarketingImage");

exports.createMarketingContent = async (req, res) => {
    try {
        const ContentExists = await MarketingContent.findOne({ content: req.body.content });
        if (ContentExists) {
            return res.status(400).json({ error: "Content already exists" });
        }
        const Content = new MarketingContent(req.body);
        await Content.save();
        res.status(201).json(Content);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.editMarketingContent = async (req, res) => {
    try {
        const Content = await MarketingContent.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!Content) {
            return res.status(404).json({ error: "Content not found" });
        }
        res.status(200).json(Content);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.getAllMarketingContent = async (req, res) => {
    try {
        const Content = await MarketingContent.find({isDeleted: false});
        res.status(200).json(Content);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.createMarketingImage = async (req, res) => {
    try {
        const imageExists = await MarketingImage.findOne({ imageUrls: req.body.imageUrls });
        if (imageExists) {
            return res.status(400).json({ error: "Image already exists" });
        }
        const image = new MarketingImage(req.body);
        await image.save();
        res.status(201).json(image);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.editMarketingImage = async (req, res) => {
    try {
        const image = await MarketingImage.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!image) {
            return res.status(404).json({ error: "Image not found" });
        }
        res.status(200).json(image);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllMarketingImages = async (req, res) => {
    try {
        const images = await MarketingImage.find({ isDeleted: false });
        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
