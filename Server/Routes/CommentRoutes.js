const asyncHandler = require('../Utils/asyncHandler');
const router = require('express').Router();

const { auth } = require('../Middleware/auth');

const {createComment} = require('../Controllers/CommentControllers/createComment');
router.post('/create' , auth , asyncHandler(createComment));

const {deleteComment} = require('../Controllers/CommentControllers/deleteComment');
router.delete('/delete/:id' , auth , asyncHandler(deleteComment));

const {getAllComment} = require('../Controllers/CommentControllers/getComments');
router.get('/details/:id' , auth , asyncHandler(getAllComment));

const {editComment} = require('../Controllers/CommentControllers/editComment');
router.put('/edit/:id' , auth , asyncHandler(editComment));

module.exports = router;