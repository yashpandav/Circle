const router = require('express').Router();

const { auth } = require('../Middleware/auth');

const { createCategory } = require('../Controllers/CategoryController/create');
router.post('/create', auth, createCategory);

const { deleteCategory } = require('../Controllers/CategoryController/deleteCategory');
router.delete('/delete', auth, deleteCategory);

const { editCategory } = require('../Controllers/CategoryController/editCategory');
router.put('/edit', auth, editCategory);

const { getDetails } = require('../Controllers/CategoryController/getDetails');
router.get('/details/:id', getDetails);

const {addAssIntoCategory} = require('../Controllers/CategoryController/CategoryWithAssignment/addAss');
router.post('/assignment/add', addAssIntoCategory);

const {deleteAssFromCategory} = require('../Controllers/CategoryController/CategoryWithAssignment/deleteAss');
router.delete('/assignment/delete/:id', deleteAssFromCategory);

const {addPostIntoCategory} = require('../Controllers/CategoryController/CategoryWithPost/addPost');
router.post('/post/add', addPostIntoCategory);

const {deletePostFromCategory} = require('../Controllers/CategoryController/CategoryWithPost/deletePost');
router.post('/post/delete/:id', deletePostFromCategory);

module.exports = router;