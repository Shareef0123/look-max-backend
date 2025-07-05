const Joi = require("joi");

exports.validateFitnessInput = (data) => {
  const schema = Joi.object({
    userId: Joi.string().optional(),
    gender: Joi.string().valid("Male", "Female").required(),
    weight: Joi.number().positive().required(),
    height: Joi.number().positive().required(),
    age: Joi.number().integer().positive().required(),
    goal: Joi.string()
      .valid("Weight Loss", "Muscle Gain", "Maintenance")
      .required(),

    // ✅ Optional if calculated in backend
    weightChangeAmount: Joi.number().optional(),

    activityLevel: Joi.string()
      .valid("Sedentary", "Lightly Active", "Moderately Active", "Fully Active")
      .required(),

    mealType: Joi.string()
      .valid("Veg", "Non-Veg", "Vegan", "Keto", "Low Carb", "Other") // or whatever you support
      .required(),

    targetDate: Joi.number().integer().positive().required(), // Number of days
    targetWeight: Joi.number().positive().required(),

    hasHealthIssues: Joi.boolean().required(),
    healthIssuesDescription: Joi.string().when("hasHealthIssues", {
      is: true,
      then: Joi.string().required(),
      otherwise: Joi.optional(),
    }),
  });

  return schema.validate(data);
};
