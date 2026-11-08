const express = require("express");
const router = express.Router();
const { login, registerAdmin, listAdmins, toggleAdmin, getMe } = require("../controllers/authController");
const { authenticate, requireSuperAdmin } = require("../middleware/authMiddleware");

router.post("/login", login);
router.get("/me", authenticate, getMe);
router.post("/register", authenticate, requireSuperAdmin, registerAdmin);
router.get("/admins", authenticate, requireSuperAdmin, listAdmins);
router.patch("/admins/:id/toggle", authenticate, requireSuperAdmin, toggleAdmin);

module.exports = router;
