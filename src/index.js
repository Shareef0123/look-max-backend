require("dotenv").config();
const express = require("express");
const app = express();
const fitnessRoute = require("./routes/fitnessRoute");
const authRoutes = require("./routes/authRoutes");
const dietRoutes = require("./routes/dietRoutes");
const workoutRoute = require("./routes/workoutRoute");
const updateRoute = require("./routes/updateRoute");
const getProfile = require("./routes/getProfile");
// const checkMeals = require("./routes/checkMealsRoute");
const checkBreakfast = require("./routes/checkMealsRoute");
const checkWorkout = require("./routes/checkWorkoutRoute");

// Middleware to parse JSON
app.use(express.json());

// Mount routes
app.use("/", authRoutes);
app.use("/api/fitness", fitnessRoute);
app.use("/dietToday", dietRoutes);
app.use("/workoutToday", workoutRoute);
app.use("/updateProfile", updateRoute);
app.use("/getProfile", getProfile);
app.use("/checkMeals", checkBreakfast);
app.use("/checkWorkout", checkWorkout);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
