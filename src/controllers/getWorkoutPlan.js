const db = require("../config/db");

exports.getWorkoutPlanForToday = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Map: Sunday (0) → day7, Monday (1) → day1, ..., Saturday (6) → day6
    const todayIndex = new Date().getDay();
    const dayMap = ["day7", "day1", "day2", "day3", "day4", "day5", "day6"];
    const todayKey = dayMap[todayIndex];

    const snapshot = await db
      .collection("workoutPlans")
      .where("userId", "==", userId)
      .get();

    if (snapshot.empty) {
      return res
        .status(404)
        .json({ error: "No workout plan found for this user." });
    }

    const planDoc = snapshot.docs[0].data();
    console.log(planDoc.plan.workoutPlan.days);

    const todayWorkout = planDoc.plan.workoutPlan[todayKey];

    if (!todayWorkout) {
      return res
        .status(404)
        .json({ error: `No workout found for ${todayKey}.` });
    }

    res.status(200).json({
      day: todayKey,
      exercises: todayWorkout.exercises,
    });
  } catch (error) {
    console.error("❌ Error fetching workout plan:", error);
    res.status(500).json({
      error: "Failed to fetch today's workout plan",
      details: error.message,
    });
  }
};
