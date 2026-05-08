import { Router } from 'express';
import { getUsers, updateUserRole, updateOrderStatus } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// All Admin routes require: 1) logged in, 2) role = ADMIN
router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/orders/:id/status', updateOrderStatus);

export default router;