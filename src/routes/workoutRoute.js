const verifyAccessToken = require("../middlewares/verifyAccessToken");
const { getWorkoutPlanForToday } = require("../controllers/getWorkoutPlan");
const express = require("express");
const route = express.Router();

route.get("/", verifyAccessToken, getWorkoutPlanForToday);

module.exports = route;
