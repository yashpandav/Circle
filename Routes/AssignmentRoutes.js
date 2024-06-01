const router = require('express').Router();
const {auth , isTeacher} = require('../Middleware/auth');

const {createAss} = require('../Controllers/AssignmentControllers/createAss');
router.post('/createass' , auth , isTeacher , createAss);

const {editAss} = require('../Controllers/AssignmentControllers/editAss');
router.put('/editass', auth , isTeacher , editAss);
module.exports = router;