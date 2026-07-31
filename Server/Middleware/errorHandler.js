const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    console.error(err.stack);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Handle Mongoose Validation Errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    // Handle Mongoose Duplicate Key Error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate field value entered: ${field}. Please use another value.`;
    }

    // Handle Mongoose Cast Error (Invalid ID)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Resource not found. Invalid: ${err.path}`;
    }

    // Handle JWT Error
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'JSON Web Token is invalid. Try Again!!!';
    }

    // Handle JWT Expired Error
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'JSON Web Token is expired. Try Again!!!';
    }

    res.status(statusCode).json({
        success: false,
        message,
        // In production, you might want to hide the error stack
        ...(process.env.NODE_ENV === 'development' && { error: err.message, stack: err.stack }),
    });
};

module.exports = errorHandler;
