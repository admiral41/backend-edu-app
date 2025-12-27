const router = require('express').Router();
const verificationController = require('../controllers/verification.controller');
const { verifyUser, verifyAdmin } = require('../middlewares/auth');

// Admin only routes
router.get('/lecturers/pending', verifyUser, verifyAdmin, verificationController.getPendingLecturerRequests);
router.put('/lecturers/:id/process', verifyUser, verifyAdmin, verificationController.processLecturerRequest);
router.get('/lecturers', verifyUser, verifyAdmin, verificationController.getAllLecturers);
router.get('/lecturers/:id', verifyUser, verificationController.getLecturerById);

module.exports = router;