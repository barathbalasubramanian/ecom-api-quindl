const express = require('express');
const { createVariant, getVariants, getVariant, updateVariant } = require('../controllers/variantController');
const router = express.Router();

router.post('/addvariant', createVariant);
router.get('/getallvariants', getVariants);
router.get('/getvariant/:id', getVariant);
router.put('/editvariant/:id', updateVariant);

module.exports = router;