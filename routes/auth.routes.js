const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const { validateSignup, validateLecturerSignup } = require("../middlewares/validation");
const { verifyUser } = require('../middlewares/auth');

/**
 * @swagger
 * /auth/learner/signup:
 *   post:
 *     summary: Register a new learner
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstname
 *               - lastname
 *               - phone
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *               firstname:
 *                 type: string
 *                 example: John
 *               lastname:
 *                 type: string
 *                 example: Doe
 *               phone:
 *                 type: string
 *                 example: "9812345678"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "2000-01-15"
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *                 example: Male
 *               address:
 *                 type: string
 *                 example: Kathmandu
 *               currentLevel:
 *                 type: string
 *                 example: SEE
 *               stream:
 *                 type: string
 *                 example: Science
 *               schoolCollege:
 *                 type: string
 *                 example: ABC Higher Secondary School
 *               termsAccepted:
 *                 type: boolean
 *                 description: User accepted Terms and Conditions
 *                 example: true
 *               privacyPolicyAccepted:
 *                 type: boolean
 *                 description: User accepted Privacy Policy
 *                 example: true
 *     responses:
 *       201:
 *         description: Learner registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/learner/signup", authController.learnerSignup);

/**
 * @swagger
 * /auth/lecturer/signup:
 *   post:
 *     summary: Register a new lecturer (requires admin approval)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstname
 *               - lastname
 *               - phone
 *               - cv
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 format: password
 *               firstname:
 *                 type: string
 *                 example: Jane
 *               lastname:
 *                 type: string
 *                 example: Smith
 *               phone:
 *                 type: string
 *                 example: "9812345678"
 *               dob:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               address:
 *                 type: string
 *               highestEducation:
 *                 type: string
 *                 example: Masters
 *               universityCollege:
 *                 type: string
 *                 example: Tribhuvan University
 *               majorSpecialization:
 *                 type: string
 *                 example: Computer Science
 *               teachingExperience:
 *                 type: integer
 *                 example: 5
 *               employmentStatus:
 *                 type: string
 *                 example: fulltime-teacher
 *               preferredLevel:
 *                 type: string
 *                 example: plus2
 *               subjects:
 *                 type: string
 *                 description: Comma-separated list of subjects
 *                 example: Mathematics,Physics
 *               availability:
 *                 type: string
 *                 example: fulltime
 *               teachingMotivation:
 *                 type: string
 *                 example: I love teaching and want to help students succeed
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: CV/Resume file (PDF, DOC, DOCX)
 *               certificates:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Educational certificates (optional)
 *               termsAccepted:
 *                 type: boolean
 *                 description: User accepted Terms and Conditions
 *                 example: true
 *               privacyPolicyAccepted:
 *                 type: boolean
 *                 description: User accepted Privacy Policy
 *                 example: true
 *     responses:
 *       201:
 *         description: Lecturer registration submitted for approval
 *       400:
 *         description: Validation error
 */
router.post("/lecturer/signup", authController.lecturerSignup);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/verify-email/{id}/{code}:
 *   get:
 *     summary: Verify user email
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification code
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired verification code
 */
router.get("/verify-email/:id/:code", authController.verifyEmail);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", verifyUser, authController.getProfile);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", verifyUser, (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully"
  });
});

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token generated
 *       401:
 *         description: Invalid refresh token
 */
router.post("/refresh-token", authController.refreshToken);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: User not found
 */
router.post("/forgot-password", authController.forgotPassword);

/**
 * @swagger
 * /auth/lecturer/application:
 *   get:
 *     summary: Get current user's lecturer application
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lecturer application retrieved
 *       403:
 *         description: Not a lecturer applicant
 *       404:
 *         description: Application not found
 */
router.get("/lecturer/application", verifyUser, authController.getLecturerApplication);

/**
 * @swagger
 * /auth/lecturer/reapply:
 *   patch:
 *     summary: Resubmit rejected lecturer application
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *               certificates:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               teachingMotivation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Application resubmitted successfully
 *       400:
 *         description: Cannot reapply (status not rejected)
 *       403:
 *         description: Not a lecturer applicant
 */
router.patch("/lecturer/reapply", verifyUser, authController.lecturerReapply);

module.exports = router;
