const router = require("express").Router();
const weekController = require("../controllers/week.controller");
const { verifyUser, verifyRole } = require("../middlewares/auth");

// All routes require authentication
router.use(verifyUser);

// Week routes
router.post("/create", verifyRole(['LECTURER', 'ADMIN', 'SUPERADMIN']), weekController.createWeek);
router.put("/:weekId", verifyRole(['LECTURER', 'ADMIN', 'SUPERADMIN']), weekController.updateWeek);
router.delete("/:weekId", verifyRole(['LECTURER', 'ADMIN', 'SUPERADMIN']), weekController.deleteWeek);
router.get("/:weekId", weekController.getWeek);
router.get("/course/:courseId", weekController.getCourseWeeks);
router.put("/course/:courseId/reorder", verifyRole(['LECTURER', 'ADMIN', 'SUPERADMIN']), weekController.reorderWeeks);

module.exports = router;