const router = require('express').Router();

const { auth } = require('../Middleware/auth');

const { updateToDo } = require('../Controllers/ToDoControllers/addAss');
router.post('/todos:classId', auth , updateToDo);

module.exports = router;