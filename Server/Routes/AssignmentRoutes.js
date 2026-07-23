const router = require('express').Router();
const {auth} = require('../Middleware/auth');

const {createAss} = require('../Controllers/AssignmentControllers/createAss');
router.post('/create', auth , createAss);

const {editAss} = require('../Controllers/AssignmentControllers/editAss');
router.put('/edit/:id', auth , editAss);

const {deleteAss} = require('../Controllers/AssignmentControllers/deleteAss');
router.delete('/delete/:id', auth , deleteAss);

const {getAssDetails} = require('../Controllers/AssignmentControllers/getAssDetails');
router.get('/detail/:id', auth, getAssDetails);

const {submitAss} = require('../Controllers/AssignmentControllers/SubmissionController/submitAss');
router.post('/submit/:id', auth, submitAss);

const {deleteSubmittedAss} = require('../Controllers/AssignmentControllers/SubmissionController/deleteSubmision');
router.delete('/deletesubmission', auth, deleteSubmittedAss);

const {editSubmimtedAss} = require('../Controllers/AssignmentControllers/SubmissionController/editSubmitedAss');
router.put('/editsubmitted/:id', auth, editSubmimtedAss);

module.exports = router;