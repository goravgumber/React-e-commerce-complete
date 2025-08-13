const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware");
const cartController = require("../controllers/cartController");

// Add to cart (protected)
router.post("/", authenticateUser, cartController.addToCart);

// Get cart items (protected)
router.get("/", authenticateUser, cartController.getCartItems);

// Update cart item quantity (protected)
router.put("/update/:id", authenticateUser, cartController.updateCartItem);

// Remove cart item (protected)
router.delete("/remove/:id", authenticateUser, cartController.removeCartItem);

// Clear all cart items (protected)
router.delete("/clear", authenticateUser, cartController.clearCart);

module.exports = router;
