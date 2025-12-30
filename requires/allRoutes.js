const express = require("express");
const httpStatus = require("http-status");
const moment = require("moment");
const router = express.Router();
// const fcm = require("../helpers/fcm")


router.get("/", (req, res) => {
    res.json({ message: "API Working ✅" });
});
router.use("/auth", require("../routes/auth.routes"));
router.use("/verification", require("../routes/verification.routes"));
router.use("/lecturer", require("../routes/lecturer"));
router.use("/enquiry", require("../routes/enquiry.route"));
router.use("/newsletter", require("../routes/newsletter.route"));
router.use("/course", require("../routes/course.routes"));
router.use("/admin", require("../routes/admin.routes"));

module.exports = router; 
