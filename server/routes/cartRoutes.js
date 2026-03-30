const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware");
const cartController = require("../controllers/cartController");

router.post("/", authenticateUser, cartController.addToCart);
router.get("/", authenticateUser, cartController.getCartItems);
router.put("/:id", authenticateUser, cartController.updateCartItem);
router.delete("/clear", authenticateUser, cartController.clearCart);
router.delete("/:id", authenticateUser, cartController.removeCartItem);

module.exports = router;
