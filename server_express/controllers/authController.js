const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");

const JWT_SECRET = process.env.JWT_SECRET || "codechef_jwt_secret_change_in_prod_2025";

function getEnvSuperAdmins() {
  return [
    { email: process.env.SUPER_ADMIN_EMAIL, password: process.env.SUPER_ADMIN_PASSWORD },
    { email: process.env.ADMIN_1_EMAIL, password: process.env.ADMIN_1_PASSWORD },
    { email: process.env.ADMIN_2_EMAIL, password: process.env.ADMIN_2_PASSWORD },
  ].filter((acc) => acc.email && acc.password);
}

// Bootstrap super admin accounts on startup
async function ensureSuperAdmin() {
  const accounts = getEnvSuperAdmins();
  for (const acc of accounts) {
    const existing = await AdminUser.findOne({ email: acc.email.toLowerCase() });
    if (!existing) {
      const passwordHash = await bcrypt.hash(acc.password, 12);
      await AdminUser.create({
        email: acc.email.toLowerCase(),
        passwordHash,
        role: "super_admin",
        department: null,
      });
      console.log("✅ Super admin bootstrapped:", acc.email);
    }
  }
}

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await AdminUser.findOne({ email: cleanEmail });

    // Fallback: check if matches env accounts and auto-create
    if (!user) {
      const envAdmins = getEnvSuperAdmins();
      const match = envAdmins.find(
        (a) => a.email.toLowerCase().trim() === cleanEmail && a.password === password
      );
      if (match) {
        const passwordHash = await bcrypt.hash(password, 12);
        user = await AdminUser.create({
          email: cleanEmail,
          passwordHash,
          role: "super_admin",
          department: null,
        });
      }
    }

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        department: user.department,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      token,
      role: user.role,
      department: user.department,
      email: user.email,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// POST /api/auth/register — Super Admin only
const registerAdmin = async (req, res) => {
  try {
    const { email, password, department } = req.body;
    if (!email || !password || !department) {
      return res.status(400).json({ error: "email, password, and department are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await AdminUser.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({ error: "An admin with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await AdminUser.create({
      email: cleanEmail,
      passwordHash,
      role: "admin",
      department,
      isActive: true,
    });

    return res.status(201).json({
      _id: admin._id,
      email: admin.email,
      role: admin.role,
      department: admin.department,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
    });
  } catch (err) {
    console.error("Register admin error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET /api/auth/admins — Super Admin only
const listAdmins = async (req, res) => {
  try {
    const admins = await AdminUser.find({ role: "admin" })
      .select("-passwordHash")
      .sort({ createdAt: -1 });
    return res.status(200).json(admins);
  } catch (err) {
    console.error("List admins error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// PATCH /api/auth/admins/:id/toggle — Super Admin only
const toggleAdmin = async (req, res) => {
  try {
    const admin = await AdminUser.findById(req.params.id);
    if (!admin || admin.role === "super_admin") {
      return res.status(404).json({ error: "Admin not found" });
    }
    admin.isActive = !admin.isActive;
    await admin.save();
    return res.status(200).json({ _id: admin._id, isActive: admin.isActive });
  } catch (err) {
    console.error("Toggle admin error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET /api/auth/me — Any authenticated admin
const getMe = async (req, res) => {
  return res.status(200).json({
    email: req.adminUser.email,
    role: req.adminUser.role,
    department: req.adminUser.department,
  });
};

module.exports = { login, registerAdmin, listAdmins, toggleAdmin, getMe, ensureSuperAdmin };
