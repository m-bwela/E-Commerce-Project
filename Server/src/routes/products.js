import { Router } from 'express';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

router.get('/', getProducts); // Anyone can browse products
router.get('/:id', getProduct); // Anyone can view a product
router.post('/', protect, adminOnly, upload.single('image'), createProduct); // Only admins can create products
router.put('/:id', protect, adminOnly, upload.single('image'), updateProduct); // Only admins can update products
router.delete('/:id', protect, adminOnly, deleteProduct); // Only admins can delete products

export default router;