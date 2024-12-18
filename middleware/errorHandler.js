// middleware/errorHandler.js

// Custom error handler for different types of errors
const errorHandler = (err, req, res, next) => {
    // Default status code for internal server errors
    const statusCode = err.statusCode || 500;

    // Default message for internal server errors
    const message = err.message || "Something went wrong. Please try again later.";

    // Log the error (you can use a logging library like Winston or console.log for development)
    console.error(err.stack);

    // Respond with the error status code and message
    res.status(statusCode).json({
        success: false,
        error: message,
        // Optionally include stack trace in development (only in dev environments)
        stack: process.env.NODE_ENV === 'development' ? err.stack : null
    });
};

module.exports = errorHandler;
