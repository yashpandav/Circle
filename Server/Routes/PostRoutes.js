const asyncHandler = require('../Utils/asyncHandler');
const router = require('express').Router();
const { auth } = require('../Middleware/auth');
const { uploadLimiter } = require('../Middleware/rateLimiter');
const { validateFiles } = require('../Middleware/sanitize');

const { createPost } = require('../Controllers/PostControllers/createPost');
router.post('/create', auth, uploadLimiter, validateFiles, asyncHandler(createPost));

const { editPost } = require('../Controllers/PostControllers/editPost');
router.put('/edit/:id', auth, uploadLimiter, validateFiles, asyncHandler(editPost));

const { deletePost } = require('../Controllers/PostControllers/deletePost');
router.delete('/delete/:id', auth, asyncHandler(deletePost));

const { getPostDetails } = require('../Controllers/PostControllers/getPostDetails');
router.get('/detail/:id', auth, asyncHandler(getPostDetails));

module.exports = router;