const asyncHandler = require('../Utils/asyncHandler');
const express = require('express');
const router = express.Router();
const { auth } = require('../Middleware/auth');
const { uploadLimiter } = require('../Middleware/rateLimiter');
const { validateFiles } = require('../Middleware/sanitize');

const { updateProfile } = require('../Controllers/UserController/profileUpdate');
router.put('/updateprofile', auth, uploadLimiter, validateFiles, asyncHandler(updateProfile));

const { deleteUser } = require('../Controllers/UserController/deleteUser');
router.delete('/deleteuser', auth, asyncHandler(deleteUser));

const { getProfile } = require('../Controllers/UserController/getUserDetails');
router.get('/getuser', auth, asyncHandler(getProfile));

const { getDashboardData } = require('../Controllers/UserController/getDashboardData');
router.get('/dashboard', auth, asyncHandler(getDashboardData));

const { createdByUser } = require('../Controllers/UserController/createdByUser');
router.get('/created', auth, asyncHandler(createdByUser));

const { joinedByUser } = require('../Controllers/UserController/joinedByUser');
router.get('/joined', auth, asyncHandler(joinedByUser));

const { totalUser } = require('../Controllers/UserController/totaluser');
router.get('/totaluser', asyncHandler(totalUser));

module.exports = router;