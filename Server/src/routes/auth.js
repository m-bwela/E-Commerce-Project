import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, logout, getMe, updateProfile, changePassword, deleteAccount, googleCallback } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import upload from '../middleware/upload.js';
import passport from '../../src/config/passport.js';

const router = Router();

router.post('/register', [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validate, register);
// Flow: validate input -> check errors -> register controller

router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
], validate, login);
// Flow: validate input -> check errors -> login controller

router.post('/logout', logout);
router.get('/me', protect, getMe);

router.patch('/profile', protect, upload.single('avatar'), updateProfile);
router.patch('/password', protect, changePassword);
router.delete('/account', protect, deleteAccount);

// ── Google OAuth ──────────────────────────────────────────────────────────
// Step 1: redirect user to Google's login page
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Step 2: Google redirects back here with a code — passport exchanges it for the user profile
// then calls our googleCallback controller to issue the JWT cookie
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=google` }),
  googleCallback
);

export default router;