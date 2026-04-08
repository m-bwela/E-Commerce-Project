const { Router } = require('express');
const { getCart, addToCart, updateCartItem, clearChart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = Router();

router.use(protect); // All cart routes require login

router.get('/', getCart); // Get current user's cart
router.post('/', addToCart); // Add item to cart
router.put('/:itemId', updateCartItem); // Update quantity of a cart item
router.delete('/', clearChart); // Clear the cart

module.exports = router;