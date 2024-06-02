const router = require('express').Router();

const { auth , isStudent } = require('../Middleware/auth');

const { updateToDo } = require('../Controllers/ToDoControllers/addAss');
router.post('/todos:classId', auth, isStudent, updateToDo);

module.exports = router;