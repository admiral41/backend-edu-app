const express = require("express");
const httpStatus = require("http-status");
const moment = require("moment");
const router = express.Router();
// const fcm = require("../helpers/fcm")


router.get("/", (req, res) => {
    res.json({ message: "API Working ✅" });
});
router.use("/verification", require("../routes/verification"));

module.exports = router; 
