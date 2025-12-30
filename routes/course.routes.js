const router = require("express").Router();
const courseController = require("../controllers/course.controller");
const { verifyUser, verifyAdmin, verifyLecturer, verifyRole } = require("../middlewares/auth");

// ======================= PUBLIC ROUTES =======================

/**
 * @swagger
 * /course:
 *   get:
 *     summary: Get all published courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 */
router.get("/", courseController.getAllCourses);

/**
 * @swagger
 * /course/search:
 *   get:
 *     summary: Search courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Search results
 */
router.get("/search", courseController.search);

/**
 * @swagger
 * /course/{slug}:
 *   get:
 *     summary: Get course details by slug
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Course slug
 *     responses:
 *       200:
 *         description: Course details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 */
router.get("/:slug", courseController.getCourseDetails);

// ======================= AUTHENTICATED ROUTES =======================

/**
 * @swagger
 * /course/{slug}/enroll:
 *   post:
 *     summary: Enroll in a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Course slug
 *     responses:
 *       200:
 *         description: Successfully enrolled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 */
router.post("/:slug/enroll", verifyUser, courseController.enrollInCourse);

/**
 * @swagger
 * /course/my-courses/all:
 *   get:
 *     summary: Get all enrolled courses for current user
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of enrolled courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *       401:
 *         description: Unauthorized
 */
router.get("/my-courses/all", verifyUser, courseController.getMyCourses);

// ======================= LECTURER ROUTES =======================

/**
 * @swagger
 * /course/create:
 *   post:
 *     summary: Create a new course (Lecturer only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: Introduction to Web Development
 *               description:
 *                 type: string
 *                 example: Learn the basics of HTML, CSS, and JavaScript
 *               price:
 *                 type: number
 *                 example: 999
 *               thumbnail:
 *                 type: string
 *                 description: Thumbnail image URL
 *     responses:
 *       201:
 *         description: Course created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a verified lecturer
 */
router.post("/create", verifyLecturer, courseController.createCourse);

/**
 * @swagger
 * /course/{slug}:
 *   put:
 *     summary: Update a course (Lecturer only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Course updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to update this course
 *       404:
 *         description: Course not found
 */
router.put("/:slug", verifyLecturer, courseController.updateCourse);

/**
 * @swagger
 * /course/my-courses/teaching:
 *   get:
 *     summary: Get courses taught by current lecturer
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of courses
 *       401:
 *         description: Unauthorized
 */
router.get("/my-courses/teaching", verifyLecturer, courseController.getMyCourses);

// ======================= ADMIN ROUTES =======================

/**
 * @swagger
 * /course/admin/pending:
 *   get:
 *     summary: Get pending course requests (Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending courses
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/admin/pending", verifyAdmin, courseController.getPendingCourseRequests);

/**
 * @swagger
 * /course/admin/{id}/process:
 *   put:
 *     summary: Approve or reject a course request (Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *               reason:
 *                 type: string
 *                 description: Reason for rejection
 *     responses:
 *       200:
 *         description: Course request processed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.put("/admin/:id/process", verifyAdmin, courseController.processCourseRequest);

/**
 * @swagger
 * /course/admin/{slug}/publish:
 *   put:
 *     summary: Toggle course publish status (Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Publish status toggled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.put("/admin/:slug/publish", verifyAdmin, courseController.toggleCoursePublish);

/**
 * @swagger
 * /course/admin/create:
 *   post:
 *     summary: Create a course (Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Course created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post("/admin/create", verifyAdmin, courseController.createCourse);

/**
 * @swagger
 * /course/admin/{slug}/assign-lecturers:
 *   put:
 *     summary: Assign lecturers to a course (Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lecturerIds
 *             properties:
 *               lecturerIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Lecturers assigned
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.put("/admin/:slug/assign-lecturers", verifyAdmin, courseController.assignLecturers);

/**
 * @swagger
 * /course/admin/{slug}/lecturers/{lecturerId}:
 *   delete:
 *     summary: Remove a lecturer from a course (Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: lecturerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lecturer removed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.delete("/admin/:slug/lecturers/:lecturerId", verifyAdmin, courseController.removeLecturer);

// ======================= HYBRID ROUTES (Both Lecturer & Admin) =======================

/**
 * @swagger
 * /course/{slug}:
 *   delete:
 *     summary: Delete a course (Lecturer/Admin)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to delete this course
 *       404:
 *         description: Course not found
 */
router.delete("/:slug", verifyRole(['LECTURER', 'ADMIN', 'SUPERADMIN']), courseController.deleteCourse);

module.exports = router;
