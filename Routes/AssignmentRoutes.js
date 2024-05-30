const router = require('express').Router();
const {auth , isTeacher} = require('../Middleware/auth');

const {createAss} = require('../Controllers/AssignmentControllers/createAss');
router.post('/createass' , auth , isTeacher , createAss);

module.exports = router;