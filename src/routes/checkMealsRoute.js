const express = require("express");
const router = express.Router();
const { markMealAsDone } = require("../controllers/checkBreakfast"); // ensure file name matches

const verifyAccessToken = require("../middlewares/verifyAccessToken");

router.post("/", verifyAccessToken, markMealAsDone);
module.exports = router;
