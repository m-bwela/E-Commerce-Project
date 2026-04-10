import { Router } from 'express';
import { getCart, addToCart, updateCartItem, clearCart } from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect); // All cart routes require login

router.get('/', getCart); // Get current user's cart
router.post('/', addToCart); // Add item to cart
router.put('/:itemId', updateCartItem); // Update quantity of a cart item
router.delete('/', clearCart); // Clear the cart

export default router;