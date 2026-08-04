const asyncHandler = require('../Utils/asyncHandler');
const router = require('express').Router();
const { auth } = require('../Middleware/auth');

const { addIntoReviewd } = require('../Controllers/ReviewAssignmentControllers/addReview');
const { removeFromReviewed } = require('../Controllers/ReviewAssignmentControllers/removeReview');
const { pendingReview } = require('../Controllers/ReviewAssignmentControllers/defaultReview');

router.post('/add', auth, asyncHandler(addIntoReviewd));
router.post('/remove', auth, asyncHandler(removeFromReviewed));
router.post('/:classId', auth, asyncHandler(pendingReview));
router.get('/:classId', auth, asyncHandler(pendingReview));
router.post('/', auth, asyncHandler(pendingReview));
router.get('/', auth, asyncHandler(pendingReview));

module.exports = router;