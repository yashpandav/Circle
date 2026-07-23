const router = require('express').Router();

const { auth } = require('../Middleware/auth');

const {addIntoReviewd} = require('../Controllers/ReviewAssignmentControllers/addReview');
router.post('/add' , auth , addIntoReviewd);

const {removeFromReviewed} = require('../Controllers/ReviewAssignmentControllers/removeReview');
router.post('/remove' , auth , removeFromReviewed);

const { pendingReview } = require('../Controllers/ReviewAssignmentControllers/defaultReview');
router.post('/:classId', auth, pendingReview);

module.exports = router;