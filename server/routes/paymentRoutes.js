const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware");
const paymentController = require("../controllers/paymentController");

router.post(
  "/create-checkout-session",
  authenticateUser,
  paymentController.createCheckoutSession,
);

module.exports = router;
