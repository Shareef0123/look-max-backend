const express = require("express");
const router = express.Router();
const { getDietPlanForToday } = require("../controllers/getDietPlan");
const verifyAccessToken = require("../middlewares/verifyAccessToken");

router.get("/", verifyAccessToken, getDietPlanForToday);
module.exports = router;
