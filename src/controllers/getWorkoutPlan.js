const db = require("../config/db");

exports.getWorkoutPlanForToday = async (req, res) => {
  try {
    const userId = req.user.userId;

    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const todayKey = weekdays[new Date().getDay()];

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
    const daysArray = planDoc.plan.workoutPlan.days;
    console.log(daysArray);
    console.log("with plan  ", planDoc.plan);
    console.log("with workout plan  ", planDoc.plan.workoutPlan);
    console.log("with days  ", planDoc.plan.workoutPlan.days);

    const todayWorkout = daysArray.find(
      (d) => d.day.toLowerCase() === todayKey.toLowerCase()
    );

    if (!todayWorkout) {
      return res
        .status(404)
        .json({ error: `No workout found for ${todayKey}.` });
    }

    const excercisesWithIsDone = todayWorkout.exercises.map((excercise) => ({
      ...excercise,
      isDone: false,
    }));

    res.status(200).json({
      day: todayKey,
      exercises: excercisesWithIsDone,
    });
  } catch (error) {
    console.error("❌ Error fetching workout plan:", error);
    res.status(500).json({
      error: "Failed to fetch today's workout plan",
      details: error.message,
    });
  }
};
