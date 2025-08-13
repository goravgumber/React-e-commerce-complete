const jwt = require("jsonwebtoken");
const db = require("../config/db");

const authenticateUser = async (req, res, next) => {
  // Try to get token from Authorization header or cookies
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    console.error("❌ Token missing");
    return res.status(401).json({ message: "Unauthorized: Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Use async/await with promise pool
    const [results] = await db.query(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [decoded.id]
    );

    if (results.length === 0) {
      console.warn(`⚠️ No user found with ID ${decoded.id}`);
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = results[0];
    next();
  } catch (err) {
    console.error("❌ Invalid token or DB error:", err.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = authenticateUser;
