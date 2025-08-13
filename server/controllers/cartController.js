const db = require("../config/db");

// Add item to cart or update quantity if exists
const addToCart = async (req, res) => {
  const userId = req.user.id; // from authenticateUser middleware
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity) {
    return res.status(400).json({ message: "Product ID and quantity are required." });
  }

  try {
    // Check if item already in cart
    const [existingItems] = await db.query(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
      [userId, product_id]
    );

    if (existingItems.length > 0) {
      // Update quantity
      const newQuantity = existingItems[0].quantity + quantity;
      await db.query(
        "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?",
        [newQuantity, userId, product_id]
      );
    } else {
      // Insert new cart item
      await db.query(
        "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [userId, product_id, quantity]
      );
    }

    res.status(200).json({ message: "Cart updated successfully." });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Failed to add to cart." });
  }
};

// Get all cart items for the logged-in user
const getCartItems = async (req, res) => {
  const userId = req.user.id;

  try {
    const [cartItems] = await db.query(
      `SELECT c.id, c.product_id, c.quantity, p.name, p.price
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );

    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Get cart items error:", error);
    res.status(500).json({ message: "Failed to get cart items." });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  const userId = req.user.id;
  const cartItemId = req.params.id;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1." });
  }

  try {
    // Update the quantity only if the cart item belongs to the user
    const [result] = await db.query(
      "UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?",
      [quantity, cartItemId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    res.status(200).json({ message: "Cart item updated successfully." });
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({ message: "Failed to update cart item." });
  }
};

// Remove cart item
const removeCartItem = async (req, res) => {
  const userId = req.user.id;
  const cartItemId = req.params.id;

  try {
    const [result] = await db.query(
      "DELETE FROM cart WHERE id = ? AND user_id = ?",
      [cartItemId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    res.status(200).json({ message: "Cart item removed successfully." });
  } catch (error) {
    console.error("Remove cart item error:", error);
    res.status(500).json({ message: "Failed to remove cart item." });
  }
};

// Clear all cart items for user
const clearCart = async (req, res) => {
  const userId = req.user.id;

  try {
    await db.query("DELETE FROM cart WHERE user_id = ?", [userId]);
    res.status(200).json({ message: "Cart cleared successfully." });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ message: "Failed to clear cart." });
  }
};

module.exports = {
  addToCart,
  getCartItems,
  updateCartItem,
  removeCartItem,
  clearCart,
};
