const MarketingContent = require("../models/Marketing");
const MarketingImage = require("../models/Marketing");

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