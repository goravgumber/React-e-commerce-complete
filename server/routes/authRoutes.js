const express = require("express");
const router = express.Router();
const {
  register,
  login,
  me,
  updateProfile,
  forgotPassword,
  logout,
} = require("../controllers/authController");
const authenticateUser = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);

router.get("/me", authenticateUser, me);
router.put("/update", authenticateUser, updateProfile);
router.post("/logout", authenticateUser, logout);

module.exports = router;
