/**
 * rateLimiter.js
 * -----------------------------------------------------------
 * Per-route rate-limiting presets to prevent brute-force
 * and DDoS attacks on sensitive endpoints.
 */

const rateLimit = require('express-rate-limit');

const createLimiter = (windowMinutes, max, message) =>
    rateLimit({
        windowMs: windowMinutes * 60 * 1000,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { success: false, message },
    });

// Auth routes – very strict (brute-force protection)
const authLimiter = createLimiter(
    15, 20,
    'Too many authentication attempts. Please wait 15 minutes and try again.'
);

// OTP generation – prevent OTP flooding / email bombing
const otpLimiter = createLimiter(
    10, 5,
    'Too many OTP requests. Please wait 10 minutes.'
);

// General API routes – relaxed
const generalLimiter = createLimiter(
    1, 100,
    'Too many requests. Please slow down.'
);

// File upload endpoints – prevent storage abuse
const uploadLimiter = createLimiter(
    10, 30,
    'Too many upload requests. Please try again later.'
);

module.exports = { authLimiter, otpLimiter, generalLimiter, uploadLimiter };
