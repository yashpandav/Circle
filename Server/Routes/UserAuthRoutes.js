const asyncHandler = require('../Utils/asyncHandler');
const router = require("express").Router();
const { auth } = require('../Middleware/auth');

const { signUp } = require('../Controllers/AuthControllers/SignUp');
const { LogIn } = require('../Controllers/AuthControllers/LogIn');
const { genrateOtp } = require('../Controllers/AuthControllers/OtpGenerate');
const { changePassword } = require('../Controllers/AuthControllers/changePassword');
const { LogOut } = require('../Controllers/AuthControllers/LogOut');
const { validateLogin } = require('../Controllers/AuthControllers/validateLogin');
const { validateEmail } = require('../Controllers/AuthControllers/validateEmail');
const { forgotPassword } = require('../Controllers/AuthControllers/forgotPassword');

router.post('/signup', asyncHandler(signUp));
router.post('/login', asyncHandler(LogIn));
router.post('/genrateotp', asyncHandler(genrateOtp));
router.post('/changepassword', auth, asyncHandler(changePassword));
router.post('/logout', asyncHandler(LogOut));
router.post('/validate', auth, asyncHandler(validateLogin));
router.post('/validate-otp', asyncHandler(validateEmail));
router.post('/forgot-password', asyncHandler(forgotPassword));

module.exports = router;