const errorHandler = (err, req, res, next) => {
  // If someone forgot to set a status code, default to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    // Only show the full error trace in development, not production (security)
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export default errorHandler;