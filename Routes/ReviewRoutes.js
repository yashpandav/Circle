const router = require('express').Router();

const { auth } = require('../Middleware/auth');

const {addIntoReviewd} = require('../Controllers/ReviewAssignmentControllers/addReview');
router.post('/add' , auth , addIntoReviewd);

const {removeFromReviewed} = require('../Controllers/ReviewAssignmentControllers/removeReview');
router.post('/remove' , auth , removeFromReviewed);

module.exports = router;