// server/controllers/shippingController.js
const db = require("../config/db");

// Create or update shipping address for current user
exports.saveAddress = (req, res) => {
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

  // Insert a new address (you can also implement update by id later)
  const query =
    "INSERT INTO shipping_addresses (user_id, full_name, address_line1, address_line2, city, state, postal_code, country, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(
    query,
    [userId, full_name, address_line1, address_line2 || "", city, state || "", postal_code, country, phone || ""],
    (err, result) => {
      if (err) {
        console.error("DB error saveAddress:", err);
        return res.status(500).json({ message: "Database error" });
      }
      // return created address id and full payload for frontend
      const addressId = result.insertId;
      db.query("SELECT * FROM shipping_addresses WHERE id = ?", [addressId], (err2, rows) => {
        if (err2) {
          console.error("DB error fetching address:", err2);
          return res.status(500).json({ message: "Database error" });
        }
        res.status(201).json(rows[0]);
      });
    }
  );
};

// Get saved addresses for user
exports.getAddresses = (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  db.query("SELECT * FROM shipping_addresses WHERE user_id = ? ORDER BY created_at DESC", [userId], (err, rows) => {
    if (err) {
      console.error("DB error getAddresses:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(rows);
  });
};

// Get single address by id (protected)
exports.getAddressById = (req, res) => {
  const userId = req.user?.id;
  const id = req.params.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  db.query("SELECT * FROM shipping_addresses WHERE id = ? AND user_id = ?", [id, userId], (err, rows) => {
    if (err) {
      console.error("DB error getAddressById:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (!rows.length) return res.status(404).json({ message: "Address not found" });
    res.json(rows[0]);
  });
};
