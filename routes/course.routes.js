const router = require("express").Router();
const courseController = require("../controllers/course.controller");
const { verifyUser, verifyAdmin, verifyLecturer, verifyRole } = require("../middlewares/auth");

// ======================= PUBLIC ROUTES =======================
router.get("/", courseController.getAllCourses);
router.get("/search", courseController.search);
router.get("/:slug", courseController.getCourseDetails);

// ======================= AUTHENTICATED ROUTES =======================
router.post("/:slug/enroll", verifyUser, courseController.enrollInCourse);
router.get("/my-courses/all", verifyUser, courseController.getMyCourses);

// ======================= LECTURER ROUTES =======================
router.post("/create", verifyLecturer, courseController.createCourse);
router.put("/:slug", verifyLecturer, courseController.updateCourse);
router.get("/my-courses/teaching", verifyLecturer, courseController.getMyCourses);

// ======================= ADMIN ROUTES =======================
// Course approval system
router.get("/admin/pending", verifyAdmin, courseController.getPendingCourseRequests);
router.put("/admin/:id/process", verifyAdmin, courseController.processCourseRequest);
router.put("/admin/:slug/publish", verifyAdmin, courseController.toggleCoursePublish);

// Course management
router.post("/admin/create", verifyAdmin, courseController.createCourse);
router.put("/admin/:slug/assign-lecturers", verifyAdmin, courseController.assignLecturers);
router.delete("/admin/:slug/lecturers/:lecturerId", verifyAdmin, courseController.removeLecturer);

// ======================= HYBRID ROUTES (Both Lecturer & Admin) =======================
router.delete("/:slug", verifyRole(['LECTURER', 'ADMIN', 'SUPERADMIN']), courseController.deleteCourse);

module.exports = router;