const express = require('express');
const { createCategory, getCategories, getCategory, updateCategory } = require('../controllers/categoryController');
const router = express.Router();

router.post('/addcategory', createCategory);
router.get('/allcategory', getCategories);
router.get('/category/:id', getCategory);
router.put('/editcategory/:id', updateCategory);

module.exports = router;