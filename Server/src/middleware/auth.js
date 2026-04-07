const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// Protect routes — only logged-in users can access
const protect = async (req, res, next) => {
  try {
    // Step 1: Look for the token in cookies OR the Authorization header
    const token = req.cookies.token ||
      req.headers.authorization?.split(' ')[1];
    //                          ↑ "Bearer eyJhbG..." → splits by space → takes the token part

    // Step 2: No token? Not logged in.
    if (!token) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Step 3: Verify the token is real and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: "user-uuid-here", iat: ..., exp: ... }

    // Step 4: Find the user in the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, fullName: true, email: true, role: true }
      // select = only return these fields (don't return the password!)
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Step 5: Attach user to the request so controllers can use it
    req.user = user;
    next();  // "OK, you may pass. Continue to the next function."
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized' });
  }
};

// Admin-only guard — must be used AFTER protect
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = { protect, adminOnly };