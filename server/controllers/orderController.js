const { OrderStatus } = require("@prisma/client");
const prisma = require("../lib/prisma");

const normalizeItemsInput = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order must contain items");
  }

  const normalized = items.map((item) => ({
    product_id: Number(item.product_id),
    quantity: Number(item.quantity),
  }));

  for (const item of normalized) {
    if (!Number.isInteger(item.product_id) || item.product_id <= 0) {
      throw new Error("Invalid product_id in items");
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error("Quantity must be a positive integer");
    }
  }

  return normalized;
};

const prepareValidatedItems = async (items, tx = prisma) => {
  const normalizedItems = normalizeItemsInput(items);
  const productIds = [...new Set(normalizedItems.map((item) => item.product_id))];

  const products = await tx.product.findMany({
    where: {
      id: { in: productIds },
    },
    select: {
      id: true,
      name: true,
      price: true,
      stock: true,
      image: true,
    },
  });

  if (products.length !== productIds.length) {
    throw new Error("One or more products were not found");
  }

  const productMap = new Map(products.map((product) => [product.id, product]));

  let total = 0;
  const validatedItems = normalizedItems.map((item) => {
    const product = productMap.get(item.product_id);

    if (!product) {
      throw new Error(`Product ${item.product_id} not found`);
    }

    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    const unitPrice = Number(product.price);
    total += unitPrice * item.quantity;

    return {
      product_id: product.id,
      quantity: item.quantity,
      unit_price: unitPrice,
      name: product.name,
      image: product.image || "",
    };
  });

  return {
    validatedItems,
    total: Number(total.toFixed(2)),
  };
};

const mapStatusToEnum = (status) => {
  if (!status) return OrderStatus.PENDING;
  const normalized = String(status).toUpperCase();
  return OrderStatus[normalized] || OrderStatus.PENDING;
};

const serializeOrder = (order) => ({
  id: order.id,
  total: Number(order.total),
  created_at: order.createdAt,
  payment_status: String(order.status).toLowerCase(),
  items: (order.items || []).map((item) => ({
    id: item.productId,
    product_id: item.productId,
    quantity: item.quantity,
    price: Number(item.price),
    name: item.product?.name || "",
    image: item.product?.image || "",
  })),
});

const createOrderWithTransaction = async ({
  userId,
  items,
  shipping_id = null,
  payment_intent_id = null,
  payment_status = OrderStatus.PENDING,
  clearCart = true,
}) => {
  if (!userId) {
    throw new Error("Unauthorized");
  }

  return prisma.$transaction(async (tx) => {
    if (payment_intent_id) {
      const existingOrder = await tx.order.findFirst({
        where: { paymentIntentId: payment_intent_id },
        select: { id: true },
      });

      if (existingOrder) {
        return {
          orderId: existingOrder.id,
          total: null,
          alreadyExists: true,
        };
      }
    }

    const { validatedItems, total } = await prepareValidatedItems(items, tx);

    for (const item of validatedItems) {
      const stockUpdateResult = await tx.product.updateMany({
        where: {
          id: item.product_id,
          stock: { gte: item.quantity },
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });

      if (stockUpdateResult.count === 0) {
        throw new Error(`Insufficient stock for ${item.name}`);
      }
    }

    const order = await tx.order.create({
      data: {
        userId,
        total,
        status: mapStatusToEnum(payment_status),
        paymentIntentId: payment_intent_id || null,
        shippingAddressId: shipping_id || null,
      },
      select: { id: true },
    });

    await tx.orderItem.createMany({
      data: validatedItems.map((item) => ({
        orderId: order.id,
        productId: item.product_id,
        quantity: item.quantity,
        price: item.unit_price,
      })),
    });

    if (clearCart) {
      await tx.cart.deleteMany({ where: { userId } });
    }

    return {
      orderId: order.id,
      total,
      alreadyExists: false,
    };
  });
};

exports.createOrder = async (req, res) => {
  const userId = req.user?.id;
  const { items, shipping_id = null, payment_intent_id = null } = req.body;

  try {
    const result = await createOrderWithTransaction({
      userId,
      items,
      shipping_id,
      payment_intent_id,
      payment_status: payment_intent_id ? OrderStatus.PAID : OrderStatus.PENDING,
      clearCart: true,
    });

    return res.status(201).json({
      message: result.alreadyExists ? "Order already exists" : "Order placed successfully",
      id: result.orderId,
      total: result.total,
    });
  } catch (error) {
    const status = error.message === "Unauthorized" ? 401 : 400;
    console.error("Order creation failed:", error.message);
    return res.status(status).json({ message: error.message || "Order creation failed" });
  }
};

exports.getOrders = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(orders.map(serializeOrder));
  } catch (error) {
    console.error("DB error fetching orders:", error);
    return res.status(500).json({ message: "Database error" });
  }
};

exports.getOrderById = async (req, res) => {
  const userId = req.user?.id;
  const orderId = Number(req.params.id);

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return res.status(400).json({ message: "Invalid order id" });
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json(serializeOrder(order));
  } catch (error) {
    console.error("DB error get order:", error);
    return res.status(500).json({ message: "Database error" });
  }
};

exports.createOrderWithTransaction = createOrderWithTransaction;
exports.prepareValidatedItems = prepareValidatedItems;
