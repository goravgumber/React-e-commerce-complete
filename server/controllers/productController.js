const prisma = require("../lib/prisma");

const serializeProduct = (product) => ({
  id: product.id,
  name: product.name,
  description: product.description || "",
  price: Number(product.price),
  stock: product.stock,
  image: product.image || "",
  created_at: product.createdAt,
});

exports.getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.json(products.map(serializeProduct));
  } catch (err) {
    console.error("Error fetching products:", err);
    return res.status(500).json({ message: "Error fetching products" });
  }
};

exports.addProduct = async (req, res) => {
  const { name, description, price, stock, image } = req.body;

  if (!name || price === undefined || stock === undefined) {
    return res.status(400).json({ message: "Name, price, and stock are required" });
  }

  const parsedPrice = Number(price);
  const parsedStock = Number(stock);

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ message: "Price must be a valid non-negative number" });
  }

  if (!Number.isInteger(parsedStock) || parsedStock < 0) {
    return res.status(400).json({ message: "Stock must be a non-negative integer" });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: String(name).trim(),
        description: description ? String(description).trim() : "",
        price: parsedPrice,
        stock: parsedStock,
        image: image ? String(image).trim() : "",
      },
    });

    return res.status(201).json({ message: "Product added", productId: product.id });
  } catch (err) {
    console.error("Error adding product:", err);
    return res.status(500).json({ message: "Error adding product" });
  }
};

exports.updateProduct = async (req, res) => {
  const productId = Number(req.params.id);
  const { name, description, price, stock, image } = req.body;

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  if (!name || price === undefined || stock === undefined) {
    return res.status(400).json({ message: "Name, price, and stock are required" });
  }

  const parsedPrice = Number(price);
  const parsedStock = Number(stock);

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ message: "Price must be a valid non-negative number" });
  }

  if (!Number.isInteger(parsedStock) || parsedStock < 0) {
    return res.status(400).json({ message: "Stock must be a non-negative integer" });
  }

  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        name: String(name).trim(),
        description: description ? String(description).trim() : "",
        price: parsedPrice,
        stock: parsedStock,
        image: image ? String(image).trim() : "",
      },
    });

    return res.json({ message: "Product updated" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Product not found" });
    }

    console.error("Error updating product:", err);
    return res.status(500).json({ message: "Error updating product" });
  }
};

exports.deleteProduct = async (req, res) => {
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  try {
    await prisma.product.delete({ where: { id: productId } });
    return res.json({ message: "Product deleted" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Product not found" });
    }

    console.error("Error deleting product:", err);
    return res.status(500).json({ message: "Error deleting product" });
  }
};
