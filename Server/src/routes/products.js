const { Router } = require('express');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

const router = Router();

router.get('/', getProducts); // Anyone can browse products
router.get('/:id', getProduct); // Anyone can view a product
router.post('/', protect, admin, createProduct); // Only admins can create products
router.put('/:id', protect, admin, updateProduct); // Only admins can update products
router.delete('/:id', protect, admin, deleteProduct); // Only admins can delete products

module.exports = router;