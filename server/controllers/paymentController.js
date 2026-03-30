const Stripe = require("stripe");
const prisma = require("../lib/prisma");
const {
  prepareValidatedItems,
  createOrderWithTransaction,
} = require("./orderController");

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? Stripe(stripeSecretKey) : null;

const pendingCheckouts = new Map();

const ensureStripe = () => {
  if (!stripe) {
    const error = new Error("Stripe is not configured on server");
    error.status = 500;
    throw error;
  }
};

const validateShipping = (shipping) => {
  if (!shipping || typeof shipping !== "object") {
    throw new Error("Shipping details are required");
  }

  const normalized = {
    name: (shipping.name || "").trim(),
    address: (shipping.address || "").trim(),
    city: (shipping.city || "").trim(),
    postalCode: (shipping.postalCode || "").trim(),
    country: (shipping.country || "India").trim(),
  };

  if (!normalized.name || !normalized.address || !normalized.city || !normalized.postalCode) {
    throw new Error("Complete shipping info is required");
  }

  return normalized;
};

const saveShippingAddress = async (userId, shipping) => {
  const address = await prisma.shippingAddress.create({
    data: {
      userId,
      fullName: shipping.name,
      address: shipping.address,
      city: shipping.city,
      postalCode: shipping.postalCode,
      country: shipping.country || "India",
    },
    select: { id: true },
  });

  return address.id;
};

exports.createCheckoutSession = async (req, res) => {
  try {
    ensureStripe();

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { items, shipping } = req.body;
    const normalizedShipping = validateShipping(shipping);

    const { validatedItems, total } = await prepareValidatedItems(items);

    const imageBaseUrl = process.env.PUBLIC_IMAGE_BASE_URL
      || `${process.env.BACKEND_URL || "http://localhost:5000"}/images`;

    const line_items = validatedItems.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
          images: item.image ? [`${imageBaseUrl}/${item.image}`] : [],
        },
        unit_amount: Math.round(item.unit_price * 100),
      },
      quantity: item.quantity,
    }));

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${frontendUrl}/orders?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/cart?payment=cancelled`,
      client_reference_id: String(userId),
      metadata: {
        userId: String(userId),
        shipping_name: normalizedShipping.name,
        shipping_address: normalizedShipping.address,
        shipping_city: normalizedShipping.city,
        shipping_postalCode: normalizedShipping.postalCode,
        shipping_country: normalizedShipping.country,
      },
    });

    pendingCheckouts.set(session.id, {
      userId,
      items: validatedItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
      shipping: normalizedShipping,
      expectedTotalInPaise: Math.round(total * 100),
    });

    return res.status(200).json({ id: session.id });
  } catch (error) {
    const status = error.status || 400;
    console.error("Create checkout session error:", error.message || error);
    return res.status(status).json({ message: error.message || "Unable to create checkout session" });
  }
};

exports.handleWebhook = async (req, res) => {
  let event;

  try {
    ensureStripe();

    if (process.env.STRIPE_WEBHOOK_SECRET) {
      const signature = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } else {
      const payload = Buffer.isBuffer(req.body)
        ? req.body.toString("utf8")
        : JSON.stringify(req.body || {});
      event = JSON.parse(payload);
    }
  } catch (error) {
    console.error("Webhook verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const paymentStatus = session.payment_status;

      if (paymentStatus !== "paid") {
        console.warn("Checkout completed without paid status:", session.id);
        return res.status(200).json({ received: true });
      }

      const pendingData = pendingCheckouts.get(session.id);
      if (!pendingData) {
        console.warn("No pending checkout data found for session:", session.id);
        return res.status(200).json({ received: true });
      }

      if (
        Number.isInteger(pendingData.expectedTotalInPaise)
        && Number(session.amount_total) !== pendingData.expectedTotalInPaise
      ) {
        console.error("Amount mismatch for session:", session.id);
        return res.status(400).json({ message: "Payment amount mismatch" });
      }

      const shipping = pendingData.shipping;
      const shippingId = await saveShippingAddress(pendingData.userId, shipping);

      await createOrderWithTransaction({
        userId: pendingData.userId,
        items: pendingData.items,
        shipping_id: shippingId,
        payment_intent_id: session.payment_intent || null,
        payment_status: "PAID",
        clearCart: true,
      });

      pendingCheckouts.delete(session.id);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error.message || error);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
};
