const { Router } = require('express');
const { createOrder, getOrders, getOrder, getAllOrders } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

const router = Router();

router.use(protect); // All order routes require login

router.post('/', createOrder); // Create a new order from cart
router.get('/', getOrders); // Get current user's orders
router.get('/all', admin, getAllOrders); // Admin: get all orders
router.get('/:id', getOrder); // Get a single order (only if it belongs to the user)

module.exports = router;