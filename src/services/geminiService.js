require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

/**
 * Calls Gemini and extracts JSON safely from response
 */
exports.callGeminiAndParseJSON = async (prompt) => {
  const result = await model.generateContent(prompt);
  const raw = (await result.response).text();

  // Optional: Remove markdown JSON code fences like ```json ... ```
  const cleanedRaw = raw.replace(/```json|```/g, "").trim();

  // Detect JSON start and end characters
  const startObj = cleanedRaw.indexOf("{");
  const startArr = cleanedRaw.indexOf("[");
  if (startObj === -1 && startArr === -1) {
    throw new Error("No JSON start character found");
  }

  // Choose the earliest start position (either '{' or '[')
  const jsonStart = startObj === -1 ? startArr : (startArr === -1 ? startObj : Math.min(startObj, startArr));

  const endObj = cleanedRaw.lastIndexOf("}");
  const endArr = cleanedRaw.lastIndexOf("]");
  if (endObj === -1 && endArr === -1) {
    throw new Error("No JSON end character found");
  }

  // Choose the latest end position (either '}' or ']')
  const jsonEnd = endObj === -1 ? endArr : (endArr === -1 ? endObj : Math.max(endObj, endArr));

  const cleanJson = cleanedRaw.substring(jsonStart, jsonEnd + 1).trim();

  try {
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error("❌ Failed to parse Gemini response:", raw);
    throw new Error("Gemini returned invalid JSON");
  }
};

// 🧠 Health prompt
exports.generateHealthInsightsPrompt = ({
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
  targetDate,
  targetWeight,
}) => {
  return `Provide short, actionable fitness tips. No formatting or markdown.

                                                              User Info:
                                                              - Gender: ${gender}
                                                              - Age: ${age}
                                                              - Current Weight: ${weight}kg
                                                              - Target Weight: ${targetWeight}kg (in ${targetDate} days)
                                                              - Height: ${height}cm
                                                              - BMI: ${bmi.toFixed(2)}, BMR: ${bmr.toFixed(2)}, TDEE: ${tdee.toFixed(
    2
  )}, Adjusted TDEE: ${adjustedTDEE.toFixed(2)}
                                                                    - Activity Level: ${activityLevel}
                                                                    - Goal: ${goal}
                                                                    - Weight Change Target: ${weightChangeAmount || 0}kg
                                                                    - Health Issues: ${healthIssues}

                                                                    Give personalized suggestions.`;
};

exports.generateDietPrompt = ({
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
  targetDate,
  targetWeight,
}) => {
  return `Generate a 7-day ${mealType} diet plan in valid JSON format only. Do not include beef or pork in any meals.

Each day should be structured as:
{
  "day": "Monday",
  "meals": [
    {
      "meal": "Breakfast",
      "food": "Oatmeal with berries and almonds",
      "calories": 350,
      "isDone": false
    },
    {
      "meal": "Lunch",
      "food": "Grilled vegetable wrap with hummus",
      "calories": 500,
      "isDone": false
    },
    {
      "meal": "Dinner",
      "food": "Tofu stir-fry with brown rice",
      "calories": 600,
      "isDone": false
    }
  ]
}

Constraints:
- Each day **must** have 3 meals: Breakfast, Lunch, Dinner.
- Each meal **must** have: "meal", "food", "calories", and "isDone"
- "isDone" should always be set to false by default.
- Do NOT return null or missing values. Use realistic foods and calorie values.
- Total daily calories should be close to Adjusted TDEE: ${adjustedTDEE.toFixed(2)} kcal/day (±50 kcal).
- No markdown, explanation, or extra text — only return valid JSON array of 7 days.

Use the following user profile (DO NOT include this in the response):

- Gender: ${gender}
- Age: ${age}
- Weight: ${weight}kg → Target: ${targetWeight}kg in ${targetDate} days
- Height: ${height}cm
- Goal: ${goal}
- Activity Level: ${activityLevel}
- Health Issues: ${healthIssues || "None"}
- TDEE: ${tdee.toFixed(2)}
- Adjusted TDEE: ${adjustedTDEE.toFixed(2)}
- Weight Change Target: ${weightChangeAmount || 0}kg
`;
};

exports.generateWorkoutPrompt = ({
  gender,
  weight,
  height,
  age,
  goal,
  activityLevel,
  weightChangeAmount,
  healthIssues,
  targetDate,
  targetWeight,
}) => {
  return `Generate a 7-day workout plan in **valid JSON format only**.

The returned JSON must contain:

- "createdAt": Current date-time in ISO format (e.g., "2025-07-06T13:30:31.000Z")
- "plan": {
    "workoutPlan": [  // Array of 7 objects (Monday to Sunday)
      {
        "day": "Monday",
        "exercises": [
          {
            "name": "Exercise Name",
            "sets": 3,
            "reps": 10,
            "duration": "30 minutes" // OR "-" if not applicable,
            "isDone" : "false"
          },
          ...
        ]
      },
      ...
    ]
  }

🛑 Do NOT include any user info (gender, age, weight, etc.) in the output JSON.

📌 Requirements:
- Each day must contain **5 exercises** or 1 rest exercise (with name: "Rest", sets: 1, reps: "-", duration: "30 minutes").
- Each "exercise" must include:
  - "name" (string),
  - "sets" (number),
  - "reps" (number or string like "as many as possible" or "30 seconds hold"),
  - "duration" (string like "30 minutes", or "-" if not relevant).
- Either "reps" or "duration" must be present. Never use null.
- Output **only valid JSON**. No explanations, no markdown, no comments.

You must create this based on the user's fitness profile below (do not include this in the response):

User Profile:
- Gender: ${gender}
- Age: ${age}
- Weight: ${weight}kg → Target: ${targetWeight}kg in ${targetDate} days
- Height: ${height}cm
- Goal: ${goal}
- Activity Level: ${activityLevel}
- Weight Change Target: ${weightChangeAmount || 0}kg
- Health Issues: ${healthIssues || "None"}
`;
};