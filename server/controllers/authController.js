const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const ensureJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
};

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role.toLowerCase(),
});

const register = async (req, res) => {
  const name = (req.body.name || "").trim();
  const email = normalizeEmail(req.body.email);
  const password = req.body.password || "";

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long." });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Internal error during registration." });
  }
};

const login = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = req.body.password || "";

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    ensureJwtSecret();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal error during login." });
  }
};

const me = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: User not authenticated." });
  }

  return res.status(200).json(req.user);
};

const updateProfile = async (req, res) => {
  const userId = req.user?.id;
  const name = (req.body.name || "").trim();
  const email = normalizeEmail(req.body.email);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required." });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ message: "Email is already used by another account." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
      },
    });

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: serializeUser(updatedUser),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Internal error during profile update." });
  }
};

const forgotPassword = async (req, res) => {
  const email = normalizeEmail(req.body.email);

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    await prisma.user.findUnique({ where: { email } });

    return res.status(200).json({
      message: "If an account exists with this email, password reset instructions have been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Unable to process forgot password request." });
  }
};

const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.status(200).json({ message: "Logged out successfully." });
};

module.exports = {
  register,
  login,
  me,
  updateProfile,
  forgotPassword,
  logout,
};
