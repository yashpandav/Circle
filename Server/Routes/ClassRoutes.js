const express = require('express');
const router = express.Router();
const {auth} = require('../Middleware/auth');

const {createClass} = require('../Controllers/ClassControllers/create');
router.post('/create' , auth , createClass);

const {updateClass} = require('../Controllers/ClassControllers/update');
router.put('/update/:id' , auth , updateClass);

const {getClass} = require('../Controllers/ClassControllers/getClass');
router.get('/getdetails/:id', getClass);

const {joinClass} = require('../Controllers/ClassControllers/joinClass');
router.post('/join' ,auth, joinClass);

const {deleteClass} = require('../Controllers/ClassControllers/deleteClass');
router.delete('/delete/:id', auth , deleteClass);

const {leftClass} = require('../Controllers/ClassControllers/leftClass');
router.post('/left' , auth, leftClass);

const {getAllClass} = require('../Controllers/ClassControllers/getAllClass');
router.get('/allclass' , getAllClass);

module.exports = router;