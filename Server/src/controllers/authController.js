import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

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
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: new Date(0),
  });
  res.json({ message: 'Logged out' });
};

// --- GET CURRENT USER ---
const getMe = async (req, res) => {
  // req.user was set by the protect middleware
  res.json({ user: req.user });
};

// --- UPDATE PROFILE ---
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, email, phone, location, bio } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : undefined;

    // If email is changing, make sure it's not already taken by someone else
    if (email && email !== req.user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        res.status(400);
        throw new Error('Email already in use');
      }
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(fullName  && { fullName }),
        ...(email     && { email }),
        ...(phone     !== undefined && { phone }),
        ...(location  !== undefined && { location }),
        ...(bio       !== undefined && { bio }),
        ...(avatar    && { avatar }),
      },
      select: { id: true, fullName: true, email: true, role: true, phone: true, location: true, bio: true, avatar: true },
    });

    res.json({ user: updated });
  } catch (error) {
    next(error);
  }
};

// --- CHANGE PASSWORD ---
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Fetch user with password hash
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400);
      throw new Error('Current password is incorrect');
    }

    if (newPassword.length < 8) {
      res.status(400);
      throw new Error('New password must be at least 8 characters');
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// --- DELETE ACCOUNT ---
const deleteAccount = async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.user.id } });
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      expires: new Date(0),
    });
    res.json({ message: 'Account deleted' });
  } catch (error) {
    next(error);
  }
};

// --- GOOGLE OAUTH CALLBACK ---
// Passport has already verified the Google token and attached the user to req.user.
// Our job here is the same as a normal login: issue a JWT cookie and redirect to the app.
const googleCallback = (req, res) => {
  const token = generateToken(req.user.id);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.redirect(process.env.CLIENT_URL);
};

export { register, login, logout, getMe, updateProfile, changePassword, deleteAccount, googleCallback };