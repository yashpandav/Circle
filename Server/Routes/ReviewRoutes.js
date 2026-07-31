const asyncHandler = require('../Utils/asyncHandler');
const router = require('express').Router();

const { auth } = require('../Middleware/auth');

const {addIntoReviewd} = require('../Controllers/ReviewAssignmentControllers/addReview');
router.post('/add' , auth , asyncHandler(addIntoReviewd));

const {removeFromReviewed} = require('../Controllers/ReviewAssignmentControllers/removeReview');
router.post('/remove' , auth , asyncHandler(removeFromReviewed));

const { pendingReview } = require('../Controllers/ReviewAssignmentControllers/defaultReview');
router.post('/:classId', auth, asyncHandler(pendingReview));

module.exports = router;