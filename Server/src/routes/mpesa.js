import express from 'express';
import { stkPush, mpesaCallback, checkPaymentStatus } from '../controllers/mpesaController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST /api/mpesa/stk-push — trigger payment prompt on user's phone (requires login)
router.post('/stk-push', protect, stkPush);

// POST /api/mpesa/callback — Safaricom calls this after user approves/rejects (NO auth — public)
router.post('/callback', mpesaCallback);

// GET /api/mpesa/status/:orderId — frontend polls this to check if payment went through
router.get('/status/:orderId', protect, checkPaymentStatus);

export default router;
