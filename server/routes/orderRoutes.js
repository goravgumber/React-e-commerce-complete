const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");

// Place an order (protected)
router.post("/", authenticateUser, orderController.createOrder);

// Get orders for logged-in user (protected)
router.get("/", authenticateUser, orderController.getOrders);

// Get single order (protected)
router.get("/:id", authenticateUser, orderController.getOrderById);

module.exports = router;
