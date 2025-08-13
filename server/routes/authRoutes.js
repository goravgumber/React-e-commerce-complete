const express = require("express");
const router = express.Router();
const { register, login, me, logout } = require("../controllers/authController");
const authenticateUser = require("../middleware/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", authenticateUser, me);
router.post("/logout", authenticateUser, logout); // optional logout route

module.exports = router;
