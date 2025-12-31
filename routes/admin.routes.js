const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const announcementController = require('../controllers/announcement.controller');
const { verifyUser, verifyAdmin } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

// ======================= DASHBOARD =======================

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get admin dashboard stats (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/dashboard', verifyUser, verifyAdmin, adminController.getDashboardStats);

// ======================= USER MANAGEMENT =======================

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or phone
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [all, student, instructor, admin]
 *         description: Filter by role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, active, suspended]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', verifyUser, verifyAdmin, adminController.getAllUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get('/users/:id', verifyUser, verifyAdmin, adminController.getUserById);

/**
 * @swagger
 * /admin/users/{id}/suspend:
 *   post:
 *     summary: Suspend a user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for suspension
 *     responses:
 *       200:
 *         description: User suspended
 *       404:
 *         description: User not found
 */
router.post('/users/:id/suspend', verifyUser, verifyAdmin, adminController.suspendUser);

/**
 * @swagger
 * /admin/users/{id}/activate:
 *   post:
 *     summary: Activate a suspended user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User activated
 *       404:
 *         description: User not found
 */
router.post('/users/:id/activate', verifyUser, verifyAdmin, adminController.activateUser);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', verifyUser, verifyAdmin, adminController.deleteUser);

// ======================= ANNOUNCEMENTS =======================

// Get all announcements
router.get('/announcements', verifyUser, verifyAdmin, announcementController.getAnnouncements);

// Get single announcement
router.get('/announcements/:id', verifyUser, verifyAdmin, announcementController.getAnnouncementById);

// Create announcement
router.post('/announcements', verifyUser, verifyAdmin, announcementController.createAnnouncement);

// Update announcement
router.put('/announcements/:id', verifyUser, verifyAdmin, announcementController.updateAnnouncement);

// Delete announcement
router.delete('/announcements/:id', verifyUser, verifyAdmin, announcementController.deleteAnnouncement);

module.exports = router;
