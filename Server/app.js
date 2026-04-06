import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import cartRoutes from './routes/cart.js'
import orderRoutes from './routes/orders.js'
import mpesaRoutes from './routes/mpesa.js'
import errorHandler from './middleware/errorHandler.js'

dotenv.config()

const app = express()

// Security
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))

// Body parsing
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/mpesa', mpesaRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Error handler
app.use(errorHandler)

module.exports = app;