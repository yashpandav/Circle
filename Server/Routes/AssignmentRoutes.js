const asyncHandler = require('../Utils/asyncHandler');
const router = require('express').Router();
const {auth} = require('../Middleware/auth');

const {createAss} = require('../Controllers/AssignmentControllers/createAss');
router.post('/create', auth , asyncHandler(createAss));

const {editAss} = require('../Controllers/AssignmentControllers/editAss');
router.put('/edit/:id', auth , asyncHandler(editAss));

const {deleteAss} = require('../Controllers/AssignmentControllers/deleteAss');
router.delete('/delete/:id', auth , asyncHandler(deleteAss));

const {getAssDetails} = require('../Controllers/AssignmentControllers/getAssDetails');
router.get('/detail/:id', auth, asyncHandler(getAssDetails));

const {submitAss} = require('../Controllers/AssignmentControllers/SubmissionController/submitAss');
router.post('/submit/:id', auth, asyncHandler(submitAss));

const {deleteSubmittedAss} = require('../Controllers/AssignmentControllers/SubmissionController/deleteSubmision');
router.delete('/deletesubmission', auth, asyncHandler(deleteSubmittedAss));

const {editSubmimtedAss} = require('../Controllers/AssignmentControllers/SubmissionController/editSubmitedAss');
router.put('/editsubmitted/:id', auth, asyncHandler(editSubmimtedAss));

module.exports = router;