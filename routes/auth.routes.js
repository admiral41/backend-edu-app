const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const { validateSignup, validateLecturerSignup } = require("../middlewares/validation");
const { verifyUser } = require('../middlewares/auth');

// Public routes
router.post("/learner/signup", authController.learnerSignup);
router.post("/lecturer/signup", authController.lecturerSignup);
router.post("/login", authController.login);
router.get("/verify-email/:id/:code", authController.verifyEmail);
router.get("/profile", verifyUser, authController.getProfile);
// Logout
router.post("/logout", verifyUser, (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully"
  });
});

// Refresh token
router.post("/refresh-token", authController.refreshToken);

// Password reset routes
router.post("/forgot-password", authController.forgotPassword);

module.exports = router;