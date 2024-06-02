const router = require('express').Router();
const {auth , isTeacher} = require('../Middleware/auth');

const {createAss} = require('../Controllers/AssignmentControllers/createAss');
router.post('/createass', auth , createAss);

const {editAss} = require('../Controllers/AssignmentControllers/editAss');
router.put('/editass', auth , editAss);

const {deleteAss} = require('../Controllers/AssignmentControllers/deleteAss');
router.delete('/delete:assId', auth , deleteAss);
module.exports = router;