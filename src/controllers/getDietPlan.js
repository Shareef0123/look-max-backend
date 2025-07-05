const db = require("../config/db");
exports.getDietPlanForToday = async (req, res) => {
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
      .collection("dietPlans")
      .where("userId", "==", userId)
      .get();

    // console.log("This is the snapshot", snapshot);

    if (snapshot.empty === true) {
      return res
        .status(404)
        .json({ error: "No diet plan found for this user." });
    }

    const planDoc = snapshot.docs[0].data();
    // console.log(planDoc.plan);

    const daysArray = planDoc.plan.dietPlan.days;

    const todayDiet = daysArray?.find(
      (d) => d.day.toLowerCase() === todayKey.toLowerCase()
    );

    if (!todayDiet) {
      return res.status(404).json({ error: `No diet found for ${todayKey}.` });
    }

    res.json({ day: todayKey, meals: todayDiet.meals });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to fetch today's diet plan",
      details: error.message,
    });
  }
};
