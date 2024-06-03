const router = require("express").Router();
const {auth} = require('../Middleware/auth');

const {signUp} = require('../Controllers/AuthControllers/SignUp');
const {LogIn} = require('../Controllers/AuthControllers/LogIn');
const {genrateOtp} = require('../Controllers/AuthControllers/OtpGenerate');
const {changePassword} = require('../Controllers/AuthControllers/changePassword');

router.post('/signup' , signUp);
router.post('/login' , LogIn);
router.post('/genrateotp' , genrateOtp);
router.post('/changepassword' ,auth, changePassword);

module.exports = router;