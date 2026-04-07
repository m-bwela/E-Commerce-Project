const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  // Collects all validation errors (bad email, short password, etc.)

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    // Returns something like: { errors: [{ msg: "Valid email required", path: "email" }] }
  }
  next(); // All good, continue
};

module.exports = validate;