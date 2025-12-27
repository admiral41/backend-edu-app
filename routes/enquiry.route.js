const router = require("express").Router();
const controller = require("../controllers/enquiry.controller");
const { verifyToken, isAdminOrSuperAdmin } = require("../middlewares/auth");
const { enquiryLimiter } = require("../middlewares/rateLimiter.middleware");
const { body } = require("express-validator");

// Validation rules for creating an enquiry
const createEnquiryValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
    .escape(), // XSS protection

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),

  body('level')
    .notEmpty().withMessage('Current level is required')
    .isIn(['see', 'plus2-science', 'plus2-management', 'plus2-humanities', 'other'])
    .withMessage('Invalid level selected'),

  body('message')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Message must not exceed 1000 characters')
    .escape() // XSS protection
];

// Validation rules for updating enquiry status
const updateEnquiryValidation = [
  body('status')
    .optional()
    .isIn(['pending', 'contacted', 'resolved', 'rejected'])
    .withMessage('Invalid status'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Notes must not exceed 2000 characters')
    .escape(), // XSS protection

  body('assignedTo')
    .optional()
    .isMongoId().withMessage('Invalid user ID')
];

// ======================= PUBLIC ROUTES =======================
// Create new enquiry (no authentication required)
router.post('/', enquiryLimiter, createEnquiryValidation, controller.createEnquiry);

// ======================= ADMIN/SUPERADMIN ROUTES =======================
// All routes below require authentication and admin privileges
router.use((req, res, next) => verifyUser(req, res, next));
router.use((req, res, next) => verifyAdmin(req, res, next));

// Get all enquiries with filters and pagination
router.get('/', controller.getAllEnquiries);

// Get enquiry statistics
router.get('/stats', controller.getEnquiryStats);

// Get single enquiry by ID
router.get('/:id', controller.getEnquiryById);

// Update enquiry status/notes/assignment
router.patch('/:id', updateEnquiryValidation, controller.updateEnquiryStatus);

// Delete enquiry
router.delete('/:id', controller.deleteEnquiry);

module.exports = router;
