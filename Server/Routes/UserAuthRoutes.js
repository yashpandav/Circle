const asyncHandler = require('../Utils/asyncHandler');
const router = require("express").Router();
const { auth } = require('../Middleware/auth');
const { authLimiter, otpLimiter } = require('../Middleware/rateLimiter');

const { signUp } = require('../Controllers/AuthControllers/SignUp');
const { LogIn } = require('../Controllers/AuthControllers/LogIn');
const { genrateOtp } = require('../Controllers/AuthControllers/OtpGenerate');
const { changePassword } = require('../Controllers/AuthControllers/changePassword');
const { LogOut } = require('../Controllers/AuthControllers/LogOut');
const { validateLogin } = require('../Controllers/AuthControllers/validateLogin');
const { validateEmail } = require('../Controllers/AuthControllers/validateEmail');
const { forgotPassword } = require('../Controllers/AuthControllers/forgotPassword');

// Strict rate-limiting on all auth entry points
router.post('/signup',          authLimiter, asyncHandler(signUp));
router.post('/login',           authLimiter, asyncHandler(LogIn));
router.post('/genrateotp',      otpLimiter,  asyncHandler(genrateOtp));
router.post('/changepassword',  auth, authLimiter, asyncHandler(changePassword));
router.post('/logout',          asyncHandler(LogOut));
router.post('/validate',        auth, asyncHandler(validateLogin));
router.post('/validate-otp',    otpLimiter, asyncHandler(validateEmail));
router.post('/forgot-password', authLimiter, asyncHandler(forgotPassword));

module.exports = router;