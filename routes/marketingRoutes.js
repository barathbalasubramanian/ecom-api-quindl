const express = require('express');
const { createMarketingContent, getAllMarketingContent, editMarketingContent } = require('../controllers/MarketingController');
const { createMarketingImage, editMarketingImage, getAllMarketingImages } = require('../controllers/MarketingController');
const router = express.Router();

router.post('/addcontent', createMarketingContent);
router.get('/getallcontents', getAllMarketingContent);
router.put('/editcontent/:id', editMarketingContent);

router.post('/', createMarketingImage);
router.put('/:id', editMarketingImage);
router.get('/', getAllMarketingImages);

module.exports = router;