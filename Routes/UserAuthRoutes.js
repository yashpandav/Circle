const {auth} = require('../Middleware/auth');
const express = require("express")
const router = express.Router()

const {signUp} = require('../Controllers/AuthControllers/SignUp');
const {LogIn} = require('../Controllers/AuthControllers/LogIn');
const {genrateOtp} = require('../Controllers/AuthControllers/OtpGenerate');
const {changePassword} = require('../Controllers/AuthControllers/changePassword');

router.post('/signup' , signUp);
router.post('/login' , LogIn);
router.post('/genrateOtp' , genrateOtp);
router.post('/changePassword' ,auth, changePassword);

module.exports = router;