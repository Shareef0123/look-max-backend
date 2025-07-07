const db = require("../config/db");

exports.checkWorkout = async (req, res) => {
  try {
    const userId = req.user.userId;
    const weekdays = [
      "Sunday", // Index 0 for getDay()
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

    const docRef = snapshot.docs[0].ref; // ✅ Fix here
    const planDoc = snapshot.docs[0].data();
    const workOutDaysArray = planDoc.plan.plan.workoutPlan;

    const updatedWorkoutPlan = workOutDaysArray.map((day) =>
      day.day.toLowerCase() === todayKey.toLowerCase()
        ? { ...day, isDone: true }
        : day
    );

    await docRef.update({
      "plan.plan.workoutPlan": updatedWorkoutPlan,
    });

    res.json({
      message: `✅ ${todayKey} marked as done in workoutPlan`,
    });
  } catch (error) {
    console.error("❌ Failed to check workout:", error);
    res.status(500).json({
      error: "Failed to check workout",
      details: error.message,
    });
  }
};
