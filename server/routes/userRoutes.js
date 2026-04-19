const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  updateProfile,
  changePassword,
  deleteAccount,
  completeProfile,
} = require("../controllers/userController");

const Joi = require("joi");

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ success: false, message: error.details.map((d) => d.message).join(", ") });
  }
  req.body = value;
  next();
};

const profileSchema = Joi.object({
  name:  Joi.string().trim().min(2).max(100),
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().max(254),
}).or("name", "email");

const passwordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({ "any.required": "Current password is required" }),
  newPassword: Joi.string().min(8).max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.min":          "New password must be at least 8 characters",
      "string.pattern.base": "Must include uppercase, lowercase, and a number",
      "any.required":        "New password is required",
    }),
});

const deleteSchema = Joi.object({
  password: Joi.string().required().messages({ "any.required": "Password is required to delete account" }),
});

const completeProfileSchema = Joi.object({
  username: Joi.string().trim().min(2).max(30)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .required()
    .messages({
      "string.min":          "Username must be at least 2 characters",
      "string.max":          "Username cannot exceed 30 characters",
      "string.pattern.base": "Username can only contain letters, numbers and underscores",
      "any.required":        "Username is required",
    }),
});

router.use(protect);

router.put("/profile",          validate(profileSchema),         updateProfile);
router.put("/password",          validate(passwordSchema),         changePassword);
router.delete("/",               validate(deleteSchema),           deleteAccount);
router.post("/complete-profile", validate(completeProfileSchema),  completeProfile); // ← new

module.exports = router;