const { validateFitnessInput } = require("../validations/validators");
const {
  generateHealthInsightsPrompt,
  generateDietPrompt,
  generateWorkoutPrompt,
  callGeminiAndParseJSON,
} = require("../services/geminiService");

const db = require("../config/db");
// const { collection, addDoc } = require("firebase/firestore");

exports.generateFitnessPlan = async (req, res) => {
  try {
    const { error } = validateFitnessInput(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const userId = req.user.userId;
    const snapshot = db
      .collection("dietPlan")
      .where("userId", "==", userId)
      .get();

    if (!snapshot.empty) {
      res.status(406).json({ message: "fitness plan already generared" });
    }
    const {
      gender,
      weight,
      height,
      age,
      goal,
      activityLevel,
      mealType,
      targetDate, // number of days to reach goal
      targetWeight,
      hasHealthIssues,
      healthIssuesDescription,
    } = req.body;

    console.log(req.body);
    console.log(req.user);

    // ➤ Calculate core h  ealth metrics
    const bmi = weight / Math.pow(height / 100, 2);
    const bmr =
      gender === "Male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    const multipliers = {
      Sedentary: 1.2,
      "Lightly Active": 1.375,
      "Moderately Active": 1.55,
      "Fully Active": 1.725,
    };
    const tdee = bmr * (multipliers[activityLevel] || 1.2);

    const daysToReduce = parseInt(targetDate); // number of days
    const weightChangeAmount = weight - targetWeight;
    const calorieDelta =
      daysToReduce > 0 ? (weightChangeAmount * 7700) / daysToReduce : 0;

    const adjustedTDEE =
      goal === "Weight Loss" ? tdee - calorieDelta : tdee + calorieDelta;

    const healthIssues = hasHealthIssues ? healthIssuesDescription : "None";

    // ➤ Generate prompts for Gemini
    const healthPrompt = generateHealthInsightsPrompt({
      gender,
      weight,
      height,
      age,
      bmi,
      bmr,
      tdee,
      adjustedTDEE,
      goal,
      activityLevel,
      weightChangeAmount,
      healthIssues,
    });

    const dietPrompt = generateDietPrompt({
      gender,
      weight,
      height,
      age,
      goal,
      tdee,
      adjustedTDEE,
      activityLevel,
      weightChangeAmount,
      healthIssues,
      mealType,
    });

    const workoutPrompt = generateWorkoutPrompt({
      gender,
      weight,
      height,
      age,
      goal,
      activityLevel,
      weightChangeAmount,
      healthIssues,
    });

    // ➤ Generate plans from Gemini
    const [dietPlan, workoutPlan] = await Promise.all([
      callGeminiAndParseJSON(dietPrompt),
      callGeminiAndParseJSON(workoutPrompt),
    ]);

    // const userId = req.user.userId; // Firebase user doc ID

    // ➤ Save fitness details in Firestore
    const now = new Date();
    await db.collection("fitnessDetails").add({
      userId,
      age,
      gender,
      weight,
      height,
      activityLevel,
      goal,
      mealType,
      targetWeight,
      targetDays: daysToReduce,
      weightChangeAmount,
      calorieDelta: calorieDelta.toFixed(2),
      bmi: bmi.toFixed(2),
      bmr: bmr.toFixed(2),
      tdee: tdee.toFixed(2),
      adjustedTDEE: adjustedTDEE.toFixed(2),
      healthIssues,
      createdAt: new Date(),
      completedDays: 0,
    });

    // ➤ Save diet plan in Firestore
    const dietPlanRef = await db.collection("dietPlans").add({
      userId,
      plan: dietPlan,
      createdAt: new Date(),
    });

    const workoutPlanRef = await db.collection("workoutPlans").add({
      userId,
      plan: workoutPlan,
      createdAt: new Date(),
    });

    // ➤ Send back response
    res.json({
      bmi: bmi.toFixed(2),
      bmr: bmr.toFixed(2),
      tdee: tdee.toFixed(2),
      adjustedTDEE: adjustedTDEE.toFixed(2),
      dietPlanId: dietPlanRef.id,
      workoutPlanId: workoutPlanRef.id,
      dietPlan,
      workoutPlan,
    });
  } catch (error) {
    console.error("❌ Error generating fitness plan:", error);
    res.status(500).json({
      error: "Failed to generate fitness plan",
      details: error.message,
    });
  }
};
