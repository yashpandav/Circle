const express = require('express');
const router = express.Router();
const {auth} = require('../Middleware/auth')

const {updateProfile} = require('../Controllers/UserController/profileUpdate');
router.put('/updateprofile' , updateProfile)

const {deleteUser} = require('../Controllers/UserController/deleteUser');
router.delete('/deleteuser' , auth , deleteUser)

const {getProfile} = require('../Controllers/UserController/getUserDetails');
router.get('/getuser', auth , getProfile);

const {cretedByUser} = require('../Controllers/UserController/cretedByUser')
router.get('/created', auth , cretedByUser);

const {joinedByUser} = require('../Controllers/UserController/joinedByUser')
router.get('/joined', auth , joinedByUser);
module.exports = router;