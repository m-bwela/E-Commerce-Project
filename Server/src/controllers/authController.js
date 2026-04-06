import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/db.js'

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    })
}

// User Registration
exports.register = async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body

        // Basic validation
        if (!fullName || !email || !password) {
            res.status(400)
            throw new Error('Please provide all required fields') // Handled by errorHandler middleware
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' })
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            res.status(400)
            throw new Error('User already exists') // Handled by errorHandler middleware
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create user
        const user = await prisma.user.create({
            data: { fullName, email, password: hashedPassword },
            select: { id: true, fullName: true, email: true, role: true },
        })
        
        // Generate token
        const token = generateToken(user.id)

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {user, token},
        })
    } catch (error) {
        next(error)
    }
}

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        // Basic validation
        if (!email || !password) {
            res.status(400)
            throw new Error('Please provide email and password')            
        }

        // Find user
        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            })
        }

        // check if password matches
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            })
        }

        // Generate token
        const token = generateToken(user.id)

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        res.json({
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
            token,
        })
    } catch (error) {
        next(error)
    }
}

exports.logout = async (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
    })
    res.json({ message: 'Logged out successfully' })
}

// Get current user
exports.getMe = async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: { user: req.user },
        })
    } catch (error) {
        next(error)
    }
}