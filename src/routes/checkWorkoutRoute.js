const express = require("express");
const router = express.Router();
const verifyAccessToken = require("../middlewares/verifyAccessToken");
const { checkWorkout } = require("../controllers/checkWorkout");

router.post("/", verifyAccessToken, checkWorkout);
module.exports = router;
