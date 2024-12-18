const router = require("express").Router();
const {auth} = require('../Middleware/auth');

const {signUp} = require('../Controllers/AuthControllers/SignUp');
const {LogIn} = require('../Controllers/AuthControllers/LogIn');
const {genrateOtp} = require('../Controllers/AuthControllers/OtpGenerate');
const {changePassword} = require('../Controllers/AuthControllers/changePassword');
const {LogOut} = require('../Controllers/AuthControllers/LogOut');
const {validateLogin} = require('../Controllers/AuthControllers/validateLogin');

router.post('/signup' , signUp);
router.post('/login' , LogIn);
router.post('/genrateotp' , genrateOtp);
router.post('/changepassword' ,auth, changePassword);
router.post('/logout' ,LogOut);
router.post('/validate' , auth , validateLogin);

module.exports = router;