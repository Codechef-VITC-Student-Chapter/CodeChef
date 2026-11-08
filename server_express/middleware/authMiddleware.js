const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "codechef_jwt_secret_change_in_prod_2025";

function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized: No token" });
  try {
    req.adminUser = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
}

function requireSuperAdmin(req, res, next) {
  if (req.adminUser?.role !== "super_admin") {
    return res.status(403).json({ error: "Forbidden: Super admin only" });
  }
  next();
}

module.exports = { authenticate, requireSuperAdmin };
