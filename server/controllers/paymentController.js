// server/controllers/paymentController.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const db = require("../config/db");

/**
 * POST /api/payments/create-payment-intent
 * Body: { amount (in cents), currency, metadata: {orderTempId?} }
 * Returns: { clientSecret }
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = "inr", metadata = {} } = req.body;
    if (!amount || typeof amount !== "number") {
      return res.status(400).json({ message: "Amount (number, in smallest currency unit) is required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
    });

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err) {
    console.error("Stripe createPaymentIntent error:", err);
    res.status(500).json({ message: "Payment creation failed" });
  }
};

// Optional: webhook handler (if you want server-side verification of Stripe events)
exports.webhookHandler = async (req, res) => {
  // implementation depends on raw body parsing and STRIPE_WEBHOOK_SECRET
  res.status(200).send("Webhook endpoint placeholder");
};
