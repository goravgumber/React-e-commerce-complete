const prisma = require("../lib/prisma");

const serializeAddress = (address) => ({
  id: address.id,
  user_id: address.userId,
  full_name: address.fullName || "",
  address_line1: address.address,
  address_line2: address.addressLine2 || "",
  city: address.city,
  state: address.state || "",
  postal_code: address.postalCode,
  country: address.country,
  phone: address.phone || "",
  created_at: address.createdAt,
});

exports.saveAddress = async (req, res) => {
  const userId = req.user?.id;
  const {
    full_name,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country,
    phone,
  } = req.body;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!full_name || !address_line1 || !city || !postal_code || !country) {
    return res.status(400).json({ message: "Missing required address fields" });
  }

  try {
    const address = await prisma.shippingAddress.create({
      data: {
        userId,
        fullName: String(full_name).trim(),
        address: String(address_line1).trim(),
        addressLine2: address_line2 ? String(address_line2).trim() : null,
        city: String(city).trim(),
        state: state ? String(state).trim() : null,
        postalCode: String(postal_code).trim(),
        country: String(country).trim(),
        phone: phone ? String(phone).trim() : null,
      },
    });

    return res.status(201).json(serializeAddress(address));
  } catch (error) {
    console.error("DB error saveAddress:", error);
    return res.status(500).json({ message: "Database error" });
  }
};

exports.getAddresses = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const addresses = await prisma.shippingAddress.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json(addresses.map(serializeAddress));
  } catch (error) {
    console.error("DB error getAddresses:", error);
    return res.status(500).json({ message: "Database error" });
  }
};

exports.getAddressById = async (req, res) => {
  const userId = req.user?.id;
  const id = Number(req.params.id);

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid address id" });
  }

  try {
    const address = await prisma.shippingAddress.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!address) return res.status(404).json({ message: "Address not found" });
    return res.json(serializeAddress(address));
  } catch (error) {
    console.error("DB error getAddressById:", error);
    return res.status(500).json({ message: "Database error" });
  }
};
