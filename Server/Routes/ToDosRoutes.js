const asyncHandler = require('../Utils/asyncHandler');
const router = require('express').Router();
const { auth } = require('../Middleware/auth');
const { updateToDo } = require('../Controllers/ToDoControllers/addAss');

router.get('/', auth, asyncHandler(updateToDo));
router.post('/', auth, asyncHandler(updateToDo));
router.get('/:classId', auth, asyncHandler(updateToDo));
router.post('/:classId', auth, asyncHandler(updateToDo));

module.exports = router;