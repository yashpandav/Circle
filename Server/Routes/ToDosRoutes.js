const asyncHandler = require('../Utils/asyncHandler');
const router = require('express').Router();

const { auth } = require('../Middleware/auth');

const { updateToDo } = require('../Controllers/ToDoControllers/addAss');
router.post('/:classId', auth, asyncHandler(updateToDo));

module.exports = router;