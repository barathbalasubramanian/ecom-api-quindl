const express = require('express');
const { createMarketingContent, getAllMarketingContent, editMarketingContent } = require('../controllers/MarketingController');
const router = express.Router();

router.post('/addcontent', createMarketingContent);
router.get('/getallcontents', getAllMarketingContent);
router.put('/editcontent/:id', editMarketingContent);

module.exports = router;