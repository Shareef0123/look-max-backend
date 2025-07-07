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
<<<<<<< HEAD
    const daysArray = planDoc.plan.workoutPlan.days;
    console.log(daysArray);
    console.log("with plan  ", planDoc.plan);
    console.log("with workout plan  ", planDoc.plan.workoutPlan);
    console.log("with days  ", planDoc.plan.workoutPlan.days);
=======
    const daysArray = planDoc.plan.workoutPlan;
    console.log(daysArray);
    console.log("with plan  ",planDoc.plan);
    console.log("with workout plan  ",planDoc.plan.workoutPlan);
    console.log("with days  ", planDoc.plan.workoutPlan.days);
    
    
    

    
>>>>>>> 63fbeeced77bea01c5beb97d146447b715fe62c8

    const todayWorkout = daysArray.find(
      (d) => d.day.toLowerCase() === todayKey.toLowerCase()
    );

    if (!todayWorkout) {
      return res
        .status(404)
        .json({ error: `No workout found for ${todayKey}.` });
    }

<<<<<<< HEAD
    const excercisesWithIsDone = todayWorkout.exercises.map((excercise) => ({
      ...excercise,
      isDone: false,
    }));

    res.status(200).json({
      day: todayKey,
      exercises: excercisesWithIsDone,
=======
    res.status(200).json({
      day: todayKey,
      exercises: todayWorkout.exercises,
>>>>>>> 63fbeeced77bea01c5beb97d146447b715fe62c8
    });
  } catch (error) {
    console.error("❌ Error fetching workout plan:", error);
    res.status(500).json({
      error: "Failed to fetch today's workout plan",
      details: error.message,
    });
  }
};
