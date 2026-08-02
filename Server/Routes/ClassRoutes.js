const asyncHandler = require('../Utils/asyncHandler');
const express = require('express');
const router = express.Router();
const { auth } = require('../Middleware/auth');
const { uploadLimiter } = require('../Middleware/rateLimiter');
const { validateFiles } = require('../Middleware/sanitize');

const { createClass } = require('../Controllers/ClassControllers/create');
router.post('/create', auth, uploadLimiter, validateFiles, asyncHandler(createClass));

const { updateClass } = require('../Controllers/ClassControllers/update');
router.post('/update/:id', auth, uploadLimiter, validateFiles, asyncHandler(updateClass));

const { getClass } = require('../Controllers/ClassControllers/getClass');
router.get('/getdetails/:id', auth, asyncHandler(getClass));

const { joinClass } = require('../Controllers/ClassControllers/joinClass');
router.post('/join', auth, asyncHandler(joinClass));

const { deleteClass } = require('../Controllers/ClassControllers/deleteClass');
router.delete('/delete/:id', auth, asyncHandler(deleteClass));

const { leftClass } = require('../Controllers/ClassControllers/leftClass');
router.post('/left', auth, asyncHandler(leftClass));

const { getAllClass } = require('../Controllers/ClassControllers/getAllClass');
router.get('/allclass', asyncHandler(getAllClass));

const { resetEntryCode, toggleEntryCode } = require('../Controllers/ClassControllers/resetCode');
router.post('/reset-code/:id', auth, asyncHandler(resetEntryCode));
router.post('/toggle-code/:id', auth, asyncHandler(toggleEntryCode));

const { addTeacher } = require('../Controllers/ClassControllers/addTeacher');
router.post('/add-teacher', auth, asyncHandler(addTeacher));

module.exports = router;