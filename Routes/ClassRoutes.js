const express = require('express');
const router = express.Router();
const {auth , isAdmin} = require('../Middleware/auth');

const {createClass} = require('../Controllers/ClassControllers/create');
router.post('/create' , auth , createClass);

const {updateClass} = require('../Controllers/ClassControllers/update');
router.put('/update/:id' , auth , isAdmin , updateClass);

const {getClass} = require('../Controllers/ClassControllers/getClass');
router.get('/getClass/:id', getClass);

const {joinClass} = require('../Controllers/ClassControllers/joinClass');
router.post('/joinClass' ,auth, joinClass);

const {deleteClass} = require('../Controllers/ClassControllers/deleteClass');
router.delete('/deleteClass', auth , isAdmin , deleteClass);

const {leftClass} = require('../Controllers/ClassControllers/leftClass');
router.post('/leftClass' , auth, leftClass);
module.exports = router;