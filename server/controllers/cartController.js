const prisma = require("../lib/prisma");

const serializeCartItem = (item) => ({
  id: item.id,
  product_id: item.productId,
  quantity: item.quantity,
  name: item.product.name,
  price: Number(item.product.price),
  image: item.product.image || "",
});

const getUserCart = async (userId) => {
  const items = await prisma.cart.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
        },
      },
    },
    orderBy: { id: "desc" },
  });

  return items.map(serializeCartItem);
};

const addToCart = async (req, res) => {
  const userId = req.user.id;
  const productId = Number(req.body.product_id);
  const quantity = Number(req.body.quantity || 1);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ message: "Valid product_id is required." });
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ message: "Quantity must be a positive integer." });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const existingItem = await prisma.cart.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({ message: "Requested quantity exceeds available stock." });
      }

      await prisma.cart.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      if (quantity > product.stock) {
        return res.status(400).json({ message: "Requested quantity exceeds available stock." });
      }

      await prisma.cart.create({
        data: {
          userId,
          productId,
          quantity,
        },
      });
    }

    const cart = await getUserCart(userId);
    return res.status(200).json({ message: "Cart updated successfully.", items: cart });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({ message: "Failed to add to cart." });
  }
};

const getCartItems = async (req, res) => {
  const userId = req.user.id;

  try {
    const cart = await getUserCart(userId);
    return res.status(200).json(cart);
  } catch (error) {
    console.error("Get cart items error:", error);
    return res.status(500).json({ message: "Failed to get cart items." });
  }
};

const updateCartItem = async (req, res) => {
  const userId = req.user.id;
  const cartItemId = Number(req.params.id);
  const quantity = Number(req.body.quantity);

  if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
    return res.status(400).json({ message: "Invalid cart item id." });
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1." });
  }

  try {
    const cartItem = await prisma.cart.findFirst({
      where: {
        id: cartItemId,
        userId,
      },
      include: {
        product: {
          select: {
            stock: true,
          },
        },
      },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    if (quantity > cartItem.product.stock) {
      return res.status(400).json({ message: "Requested quantity exceeds available stock." });
    }

    await prisma.cart.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    const cart = await getUserCart(userId);
    return res.status(200).json({ message: "Cart item updated successfully.", items: cart });
  } catch (error) {
    console.error("Update cart item error:", error);
    return res.status(500).json({ message: "Failed to update cart item." });
  }
};

const removeCartItem = async (req, res) => {
  const userId = req.user.id;
  const cartItemId = Number(req.params.id);

  if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
    return res.status(400).json({ message: "Invalid cart item id." });
  }

  try {
    const result = await prisma.cart.deleteMany({
      where: {
        id: cartItemId,
        userId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    const cart = await getUserCart(userId);
    return res.status(200).json({ message: "Cart item removed successfully.", items: cart });
  } catch (error) {
    console.error("Remove cart item error:", error);
    return res.status(500).json({ message: "Failed to remove cart item." });
  }
};

const clearCart = async (req, res) => {
  const userId = req.user.id;

  try {
    await prisma.cart.deleteMany({
      where: { userId },
    });

    return res.status(200).json({ message: "Cart cleared successfully.", items: [] });
  } catch (error) {
    console.error("Clear cart error:", error);
    return res.status(500).json({ message: "Failed to clear cart." });
  }
};

module.exports = {
  addToCart,
  getCartItems,
  updateCartItem,
  removeCartItem,
  clearCart,
};
