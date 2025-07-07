const db = require("../config/db");

exports.markMealAsDone = async (req, res) => {
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
    const { mealType } = req.body;

    // 🔍 Fetch the user's diet plan
    const snapshot = await db
      .collection("dietPlans")
      .where("userId", "==", userId)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "No diet plan found" });
    }

    const docRef = snapshot.docs[0].ref;
    const planData = snapshot.docs[0].data();
    const planArray = planData.plan;

    // Find and update only Monday
    const updatedPlan = planArray.map((dayPlan) => {
      if (dayPlan.day.toLowerCase() === todayKey.toLowerCase()) {
        const updatedMeals = dayPlan.meals.map((meal) =>
          meal.meal.toLowerCase() === mealType.toLowerCase()
            ? { ...meal, isDone: true }
            : meal
        );
        return { ...dayPlan, meals: updatedMeals };
      }
      return dayPlan;
    });

    // Save the full updated plan back
    await docRef.update({
      plan: updatedPlan,
    });
    // ✅ Check if all meals and workouts are done, and update streak
    const updated = await checkAndUpdateCompletedDays(userId, updatedPlan);

    res.json({
      message: `✅ ${mealType} marked as done for ${todayKey}. ${
        updated ? "🎉 All meals & workouts completed! Streak updated." : ""
      }`,
    });
  } catch (error) {
    console.error("❌ Error updating meal:", error);
    res.status(500).json({
      error: "Failed to update meal",
      details: error.message,
    });
  }
};

// ✅ Embedded helper function: Check all meals & workouts, update completedDays
checkAndUpdateCompletedDays = async (userId, updatedMeals) => {
  try {
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

    const allMealsDone = updatedMeals.every((meal) => meal.isDone === true);
    if (!allMealsDone) return false;

    // 🔍 Check workouts for today
    const workoutSnap = await db
      .collection("workoutPlans")
      .where("userId", "==", userId)
      .get();

    if (workoutSnap.empty) return false;

    const workoutData = workoutSnap.docs[0].data();
    const todayWorkouts = workoutData.workouts?.[todayKey];

    if (!todayWorkouts || todayWorkouts.length === 0) return false;

    const allWorkoutsDone = todayWorkouts.every((w) => w.isDone === true);
    if (!allWorkoutsDone) return false;

    // ✅ Both meals and workouts done → increment completedDays
    const fitnessSnap = await db
      .collection("fitnessDetails")
      .where("userId", "==", userId)
      .get();

    if (!fitnessSnap.empty) {
      const fitnessRef = fitnessSnap.docs[0].ref;
      const fitnessData = fitnessSnap.docs[0].data();
      const currentCompletedDays = fitnessData.completedDays || 0;

      await fitnessRef.update({
        completedDays: currentCompletedDays + 1,
        lastCompletedAt: new Date(),
      });

      return true;
    }

    return false;
  } catch (err) {
    console.error("❌ Error in checkAndUpdateCompletedDays:", err);
    return false;
  }
};
