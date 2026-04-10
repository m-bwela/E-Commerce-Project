import { Router } from 'express';
import { createOrder, getOrders, getOrder, getAllOrders } from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(protect); // All order routes require login

router.post('/', createOrder); // Create a new order from cart
router.get('/', getOrders); // Get current user's orders
router.get('/all', adminOnly, getAllOrders); // Admin: get all orders
router.get('/:id', getOrder); // Get a single order (only if it belongs to the user)

export default router;