const express = require('express');
const router = express.Router();
const {auth} = require('../Middleware/auth')
const {updateProfile} = require('../Controllers/UserController/profileUpdate');
router.put('/updateprofile' , updateProfile)

const {deleteUser} = require('../Controllers/UserController/deleteUser');
router.delete('/deleteuser' , auth , deleteUser)

const {getProfile} = require('../Controllers/UserController/getUserDetails');
router.get('/getuser', auth , getProfile);

const {updateProfile} = require('../Controllers/UserController/profileUpdate');
router.put('/update/:id', auth , updateProfile);

module.exports = router;