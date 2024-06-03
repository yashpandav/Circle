const router = require('express').Router();

const { auth } = require('./Middleware/auth');

const {createComment} = require('../Controllers/CommentControllers/createComment');
router.post('/create' , auth , createComment);

const {deleteComment} = require('../Controllers/CommentControllers/deleteComment');
router.delete('/delete/:id' , auth , deleteComment);

const {getAllComment} = require('../Controllers/CommentControllers/getComments');
router.get('/details/:id' , getAllComment);

const {editComment} = require('../Controllers/CommentControllers/editComment');
router.get('/edit/:id' , auth , editComment);

module.exports = router;