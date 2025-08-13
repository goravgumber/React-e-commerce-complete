// server/controllers/orderController.js
const db = require("../config/db");

/**
 * Create a new order
 * Body: { items: [{ product_id, quantity, price, name }], total, shipping_id, payment_intent_id }
 */
exports.createOrder = async (req, res) => {
  const userId = req.user?.id;
  const { items, total, shipping_id = null, payment_intent_id = null } = req.body;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Order must contain items" });
  }
  if (typeof total !== "number") {
    return res.status(400).json({ message: "Total must be a number" });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1) Check stock for each item
    for (const it of items) {
      const [rows] = await connection.query(
        "SELECT stock FROM products WHERE id = ?",
        [it.product_id]
      );
      if (!rows.length || rows[0].stock < it.quantity) {
        throw new Error(
          `Insufficient stock for ${it.name || "product " + it.product_id}`
        );
      }
    }

    // 2) Deduct stock
    for (const it of items) {
      await connection.query(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [it.quantity, it.product_id]
      );
    }

    // 3) Insert into orders table
    const [orderRes] = await connection.query(
      `INSERT INTO orders 
        (user_id, total, shipping_id, payment_intent_id, payment_status) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId,
        total,
        shipping_id,
        payment_intent_id || null,
        payment_intent_id ? "paid" : "pending",
      ]
    );
    const orderId = orderRes.insertId;

    // 4) Insert into order_items table
    const itemsValues = items.map((it) => [
      orderId,
      it.product_id,
      it.quantity,
      it.price,
    ]);
    await connection.query(
      "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?",
      [itemsValues]
    );

    // 5) Clear cart
    await connection.query("DELETE FROM cart WHERE user_id = ?", [userId]);

    await connection.commit();
    connection.release();

    res.status(201).json({ message: "Order placed successfully", orderId });
  } catch (err) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (e) {
        console.error("Rollback error:", e);
      }
      connection.release();
    }
    console.error("❌ Order creation failed:", err);
    res.status(400).json({ message: err.message || "Order creation failed" });
  }
};

/**
 * Get all orders for the logged-in user
 */
exports.getOrders = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const [orders] = await db.query(
      "SELECT id AS order_id, total, created_at, payment_status FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    if (!orders.length) return res.json([]);

    const orderIds = orders.map((o) => o.order_id);
    const [items] = await db.query(
      `SELECT oi.order_id, oi.product_id, oi.quantity, oi.price, p.name, p.image
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id IN (?)`,
      [orderIds]
    );

    const itemsByOrder = {};
    items.forEach((it) => {
      if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = [];
      itemsByOrder[it.order_id].push({
        product_id: it.product_id,
        quantity: it.quantity,
        price: Number(it.price),
        name: it.name,
        image: it.image,
      });
    });

    const result = orders.map((o) => ({
      order_id: o.order_id,
      total: Number(o.total),
      created_at: o.created_at,
      payment_status: o.payment_status,
      items: itemsByOrder[o.order_id] || [],
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ DB error fetching orders:", err);
    res.status(500).json({ message: "Database error" });
  }
};

/**
 * Get a single order by ID for the logged-in user
 */
exports.getOrderById = async (req, res) => {
  const userId = req.user?.id;
  const orderId = req.params.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const [orders] = await db.query(
      "SELECT id AS order_id, total, created_at, payment_status FROM orders WHERE id = ? AND user_id = ?",
      [orderId, userId]
    );

    if (!orders.length) {
      return res.status(404).json({ message: "Order not found" });
    }

    const [items] = await db.query(
      `SELECT oi.product_id, oi.quantity, oi.price, p.name, p.image
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    res.json({
      order_id: orders[0].order_id,
      total: Number(orders[0].total),
      created_at: orders[0].created_at,
      payment_status: orders[0].payment_status,
      items: items.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
        price: Number(i.price),
        name: i.name,
        image: i.image,
      })),
    });
  } catch (err) {
    console.error("❌ DB error get order:", err);
    res.status(500).json({ message: "Database error" });
  }
};
