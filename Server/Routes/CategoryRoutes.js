const asyncHandler = require('../Utils/asyncHandler');
const router = require('express').Router();

const { auth } = require('../Middleware/auth');

const { createCategory } = require('../Controllers/CategoryController/create');
router.post('/create', auth, asyncHandler(createCategory));

const { deleteCategory } = require('../Controllers/CategoryController/deleteCategory');
router.delete('/delete/:id', auth, asyncHandler(deleteCategory));

const { editCategory } = require('../Controllers/CategoryController/editCategory');
router.put('/edit', auth, asyncHandler(editCategory));

const { getDetails } = require('../Controllers/CategoryController/getDetails');
router.get('/details/:id', auth, asyncHandler(getDetails));

const {addAssIntoCategory} = require('../Controllers/CategoryController/CategoryWithAssignment/addAss');
router.post('/assignment/add', auth, asyncHandler(addAssIntoCategory));

const {deleteAssFromCategory} = require('../Controllers/CategoryController/CategoryWithAssignment/deleteAss');
router.delete('/assignment/delete/:id', auth, asyncHandler(deleteAssFromCategory));

const {addPostIntoCategory} = require('../Controllers/CategoryController/CategoryWithPost/addPost');
router.post('/post/add', auth, asyncHandler(addPostIntoCategory));

const {deletePostFromCategory} = require('../Controllers/CategoryController/CategoryWithPost/deletePost');
router.post('/post/delete/:id', auth, asyncHandler(deletePostFromCategory));

module.exports = router;