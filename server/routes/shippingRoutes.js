// server/routes/shippingRoutes.js
const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware");
const shippingController = require("../controllers/shippingController");

router.post("/", authenticateUser, shippingController.saveAddress);      // create address
router.get("/", authenticateUser, shippingController.getAddresses);     // list addresses
router.get("/:id", authenticateUser, shippingController.getAddressById); // get single

module.exports = router;
