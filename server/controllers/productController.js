const db = require("../config/db");

// GET all products (Public)
exports.getProducts = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM products");
    res.json(results);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Error fetching products" });
  }
};

// ADD new product (Protected)
exports.addProduct = async (req, res) => {
  const { name, description, price, stock, image } = req.body;

  if (!name || price === undefined || stock === undefined) {
    return res.status(400).json({ message: "Name, price, and stock are required" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO products (name, description, price, stock, image) VALUES (?, ?, ?, ?, ?)",
      [name, description || "", price, stock, image || ""]
    );

    res.status(201).json({ message: "Product added", productId: result.insertId });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ message: "Error adding product" });
  }
};

// UPDATE product by ID (Protected)
exports.updateProduct = async (req, res) => {
  const productId = req.params.id;
  const { name, description, price, stock, image } = req.body;

  if (!name || price === undefined || stock === undefined) {
    return res.status(400).json({ message: "Name, price, and stock are required" });
  }

  try {
    await db.query(
      "UPDATE products SET name=?, description=?, price=?, stock=?, image=? WHERE id=?",
      [name, description || "", price, stock, image || "", productId]
    );
    res.json({ message: "Product updated" });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: "Error updating product" });
  }
};

// DELETE product by ID (Protected)
exports.deleteProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    await db.query("DELETE FROM products WHERE id=?", [productId]);
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Error deleting product" });
  }
};
