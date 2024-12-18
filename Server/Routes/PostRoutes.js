const router = require('express').Router();
const {auth} = require('../Middleware/auth');

const {createPost} = require('../Controllers/PostControllers/createPost');
router.post('/create', auth , createPost);

const {editPost} = require('../Controllers/PostControllers/editPost');
router.put('/edit/:id', auth , editPost);

const {deletePost} = require('../Controllers/PostControllers/deletePost');
router.delete('/delete/:id', auth , deletePost);

const {getPostDetails} = require('../Controllers/PostControllers/getPostDetails');
router.get('/detail/:id' , getPostDetails);

module.exports = router;