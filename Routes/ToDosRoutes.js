const router = require('express').Router();

const { auth , isStudnet} = require('../Middleware/auth');

const { updateToDo } = require('../Controllers/ToDoControllers/addAss');
router.post('/todos' , auth , updateToDo);

module.exports = router;