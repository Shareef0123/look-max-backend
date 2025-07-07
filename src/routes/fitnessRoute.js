const express = require("express");
const router = express.Router();
const { generateFitnessPlan } = require("../controllers/fitnessController");
const verifyAccessToken = require("../middlewares/verifyAccessToken");

router.post("/", verifyAccessToken, generateFitnessPlan);

module.exports = router;
