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

    if (snapshot.empty) {
      return res
        .status(404)
        .json({ error: "No diet plan found for this user." });
    }

    const planDoc = snapshot.docs[0].data();
    const daysArray = planDoc.plan;

    const todayDiet = daysArray?.find(
      (d) => d.day.toLowerCase() === todayKey.toLowerCase()
    );

    if (!todayDiet) {
      return res.status(404).json({ error: `No diet found for ${todayKey}.` });
    }

    const mealsWithIsDone = todayDiet.meals.map((meal) => ({
      ...meal,
      isDone: false,
    }));

    res.json({ day: todayKey, meals: mealsWithIsDone });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to fetch today's diet plan",
      details: error.message,
    });
  }
};
