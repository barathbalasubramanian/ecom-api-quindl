const express = require('express');
const { createProduct, getProducts, getProduct, updateProduct } = require('../controllers/productController');
const router = express.Router();

router.post('/addproduct', createProduct);
router.get('/getallproducts', getProducts);
router.get('/getproduct/:id', getProduct);
router.put('/editproduct/:id', updateProduct);

module.exports = router;