const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    console.log("❌ Token missing");
    return res.status(401).json({ error: "Unauthorized: Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("❌ Token invalid:", err.message);
    return res.status(403).json({ error: "Unauthorized: Token invalid" });
  }
};

module.exports = verifyToken;
