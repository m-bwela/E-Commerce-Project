const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// Helper: create a JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },                          // Payload — what's stored in the token
    process.env.JWT_SECRET,          // Secret key to sign it (like a password)
    { expiresIn: '7d' }             // Token expires in 7 days
  );
};

// --- REGISTER ---
const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    // req.body = the JSON the frontend sent: { fullName: "John", email: "...", password: "..." }

    // Check if email already taken
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Hash the password — NEVER store plain text passwords
    const hashedPassword = await bcrypt.hash(password, 12);
    // "12" = salt rounds (how complex the hash is). 12 is a good default.
    // "mypassword" becomes "$2a$12$LJ3m4ys..." — impossible to reverse

    // Create user in database
    const user = await prisma.user.create({
      data: { fullName, email, password: hashedPassword },
      select: { id: true, fullName: true, email: true, role: true }
    });

    // Generate JWT token
    const token = generateToken(user.id);

    // Set token as an HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,    // JavaScript can't read this cookie (prevents XSS attacks)
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax',   // Prevents CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days in milliseconds
    });

    res.status(201).json({ user, token });
  } catch (error) {
    next(error); // Pass error to errorHandler middleware
  }
};

// --- LOGIN ---
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
      // Don't say "user not found" — that tells hackers which emails exist
    }

    // Compare password with hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    const token = generateToken(user.id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    next(error);
  }
};

// --- LOGOUT ---
const logout = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  // Set cookie to empty string with past expiry = browser deletes it
  res.json({ message: 'Logged out' });
};

// --- GET CURRENT USER ---
const getMe = async (req, res) => {
  // req.user was set by the protect middleware
  res.json({ user: req.user });
};

module.exports = { register, login, logout, getMe };