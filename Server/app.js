import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import passport from './src/config/passport.js';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

import authRoutes from './src/routes/auth.js';
import productRoutes from './src/routes/products.js';
import cartRoutes from './src/routes/cart.js';
import orderRoutes from './src/routes/orders.js';
import adminRoutes from './src/routes/admin.js';
import mpesaRoutes from './src/routes/mpesa.js';
import errorHandler from './src/middleware/errorHandler.js';

// __dirname is not available in ES modules, so we recreate it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS must come FIRST — before helmet, before everything.
// The browser sends a preflight OPTIONS request before PATCH/POST/DELETE.
// If helmet runs first, it adds headers that block cross-origin responses.
const corsOptions = {
  origin: process.env.CLIENT_URL,   // e.g. http://localhost:5173
  credentials: true,                 // allow cookies to be sent cross-origin
  methods: ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
// Explicitly handle all preflight OPTIONS requests so cookies flow correctly
app.options(/.*/, cors(corsOptions));

// Cookie parser early — protect middleware needs req.cookies before anything else
app.use(cookieParser());

// Session — only needed for the Google OAuth redirect handshake.
// Once we issue a JWT cookie, sessions are not used again.
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' },
}));
app.use(passport.initialize());
app.use(passport.session());

// Security headers — runs after CORS so it doesn't block preflight responses
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Body parsing
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mpesa', mpesaRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Error handler
app.use(errorHandler);

export default app; 