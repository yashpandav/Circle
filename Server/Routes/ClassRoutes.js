const express = require('express');
const router = express.Router();
const {auth} = require('../Middleware/auth');

const {createClass} = require('../Controllers/ClassControllers/create');
router.post('/create' , auth , createClass);

const {updateClass} = require('../Controllers/ClassControllers/update');
router.post('/update/:id' , auth , updateClass);

const {getClass} = require('../Controllers/ClassControllers/getClass');
router.get('/getdetails/:id', auth, getClass);

const {joinClass} = require('../Controllers/ClassControllers/joinClass');
router.post('/join' ,auth, joinClass);

const {deleteClass} = require('../Controllers/ClassControllers/deleteClass');
router.delete('/delete/:id', auth , deleteClass);

const {leftClass} = require('../Controllers/ClassControllers/leftClass');
router.post('/left' , auth, leftClass);

const {getAllClass} = require('../Controllers/ClassControllers/getAllClass');
router.get('/allclass' , getAllClass);

const {resetEntryCode, toggleEntryCode} = require('../Controllers/ClassControllers/resetCode');
router.post('/reset-code/:id' , auth , resetEntryCode);
router.post('/toggle-code/:id', auth, toggleEntryCode);

const { addTeacher } = require('../Controllers/ClassControllers/addTeacher');
router.post('/add-teacher', auth, addTeacher);

module.exports = router;