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
                                                                                                                          "calories": 350
                                                                                                                              },
                                                                                                                                  {
                                                                                                                                        "meal": "Lunch",
                                                                                                                                              "food": "Grilled vegetable wrap with hummus",
                                                                                                                                                    "calories": 500
                                                                                                                                                        },
                                                                                                                                                            {
                                                                                                                                                                  "meal": "Dinner",
                                                                                                                                                                        "food": "Tofu stir-fry with brown rice",
                                                                                                                                                                              "calories": 600
                                                                                                                                                                                  }
                                                                                                                                                                                    ]
                                                                                                                                                                                    }

                                                                                                                                                                                    Constraints:
                                                                                                                                                                                    - Each day **must** have 3 meals: Breakfast, Lunch, Dinner.
                                                                                                                                                                                    - Each meal **must** have: "meal", "food", "calories"
                                                                                                                                                                                    - Do NOT return null or missing values. Use realistic foods and calorie values.
                                                                                                                                                                                    - Total daily calories should be close to Adjusted TDEE: ${adjustedTDEE.toFixed(
    2
  )} kcal/day (±50 kcal).
                                                                                                                                                                                          - No markdown, explanation, or extra text — only return valid JSON array of 7 days.

                                                                                                                                                                                          User Info:
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

                                                                                                                                                                                                                Each day must include:
                                                                                                                                                                                                                - A list of exercises.
                                                                                                                                                                                                                - Each exercise must include the following:
                                                                                                                                                                                                                  - "name": Name of the exercise (string),
                                                                                                                                                                                                                    - "sets": Number of sets (number),
                                                                                                                                                                                                                      - "reps": Number of repetitions (number or string like "30 seconds hold"),
                                                                                                                                                                                                                        - "duration": Duration in minutes (string like "30 minutes") or "-" if not applicable

                                                                                                                                                                                                                        Important:
                                                                                                                                                                                                                        - Do NOT return "null" for reps or duration. If a field is not relevant, return "-" (string).
                                                                                                                                                                                                                        - Make sure either "reps" or "duration" is always provided (not both null).
                                                                                                                                                                                                                        - Use realistic workout routines based on the user's profile below.
                                                                                                                                                                                                                        - Return only valid JSON. No explanations, markdown, or text outside the JSON.

                                                                                                                                                                                                                        User Info:
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
