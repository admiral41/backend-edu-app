const router = require("express").Router();
const categoryController = require("../controllers/category.controller");
const { verifyUser, verifyAdmin } = require("../middlewares/auth");

// ======================= PUBLIC ROUTES =======================
router.get("/", categoryController.getAllCategories);
router.get("/tree", categoryController.getCategoryTree);
router.get("/root", categoryController.getRootCategories);
router.get("/search", categoryController.searchCategories);
router.get("/:slug", categoryController.getCategoryBySlug);
router.get("/:slug/children", categoryController.getChildCategories);
router.get("/:slug/courses", categoryController.getCategoryWithCourses);

// ======================= ADMIN ROUTES =======================
router.post("/create", verifyAdmin, categoryController.createCategory);
router.put("/:slug", verifyAdmin, categoryController.updateCategory);
router.delete("/:slug", verifyAdmin, categoryController.deleteCategory);
router.put("/reorder", verifyAdmin, categoryController.reorderCategories);

module.exports = router;