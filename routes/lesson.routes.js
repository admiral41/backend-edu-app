const router = require("express").Router();
const lessonController = require("../controllers/lesson.controller");
const { verifyUser, verifyRole } = require("../middlewares/auth");

// All routes require authentication
router.use(verifyUser);

// Lesson routes
router.post("/create", verifyRole(['LECTURER', 'ADMIN', 'SUPERADMIN']), lessonController.createLesson);
router.put("/:lessonId", verifyRole(['LECTURER', 'ADMIN', 'SUPERADMIN']), lessonController.updateLesson);
router.delete("/:lessonId", verifyRole(['LECTURER', 'ADMIN', 'SUPERADMIN']), lessonController.deleteLesson);
router.get("/:lessonId", lessonController.getLesson);
router.get("/week/:weekId", lessonController.getWeekLessons);
router.put("/week/:weekId/reorder", verifyRole(['LECTURER', 'ADMIN', 'SUPERADMIN']), lessonController.reorderLessons);
router.post("/:lessonId/complete", lessonController.markLessonCompleted);

module.exports = router;