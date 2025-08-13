const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware");
const Stripe = require("stripe");
require("dotenv").config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create Checkout Session route (used by frontend)
router.post("/create-checkout-session", authenticateUser, async (req, res) => {
  try {
    const { items, shipping } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart items are required" });
    }

    if (
      !shipping ||
      !shipping.name ||
      !shipping.address ||
      !shipping.city ||
      !shipping.postalCode
    ) {
      return res.status(400).json({ message: "Complete shipping info is required" });
    }

    // Build line items array for Stripe
    const line_items = items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
          images: [
            `https://yourdomain.com/images/${item.image || "placeholder.png"}`,
          ], // Replace yourdomain.com with your real domain in production
        },
        unit_amount: Math.round(Number(item.price) * 100), // Convert rupees to paise
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: process.env.FRONTEND_URL + "/orders",
      cancel_url: process.env.FRONTEND_URL + "/cart",
      shipping_address_collection: {
        allowed_countries: ["IN"], // Adjust allowed countries as needed
      },
      metadata: {
        userId: req.user.id,
        shipping_name: shipping.name,
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        shipping_postalCode: shipping.postalCode,
        shipping_country: shipping.country || "India",
      },
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("Stripe Checkout Session error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Stripe webhook to handle events (raw body parsing)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    let event;

    try {
      if (process.env.STRIPE_WEBHOOK_SECRET) {
        const sig = req.headers["stripe-signature"];
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } else {
        event = req.body; // For local testing without webhook secret
      }
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("✅ Stripe Webhook event received:", event.type);

    // Handle events you care about
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        console.log("💰 Checkout session completed:", session.id);

        // TODO: Fulfill the order here, e.g. save order to DB,
        // send confirmation email, etc.
        break;

      // Add other event types if needed

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).send();
  }
);

module.exports = router;
