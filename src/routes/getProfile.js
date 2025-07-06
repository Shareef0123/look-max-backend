const express = require("express");
const router = express.Router();
const verifyAccessToken = require("../middlewares/verifyAccessToken");
const { getProfile } = require("../controllers/profile");

router.get("/", verifyAccessToken, getProfile);

module.exports = router;
