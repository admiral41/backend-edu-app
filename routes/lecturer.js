const router = require('express').Router();
const verificationController = require('../controllers/verification.controller');
const { verifyToken, verifyLecturer } = require('../middlewares/auth');

router.get('/public', verificationController.getAllLecturers);
router.get('/public/:id', verificationController.getLecturerById);

module.exports = router;