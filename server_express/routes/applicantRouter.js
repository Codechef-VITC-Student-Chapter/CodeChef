const express = require("express");
const router = express.Router();
const {
  saveApplicant,
  getPublicEntries,
  getApplicants,
  deactivateApplicant,
  updateApplicantStatus,
  bulkUpdateApplicantStatus,
} = require("../controllers/applicantController");
const { authenticate, requireSuperAdmin } = require("../middleware/authMiddleware");

// Public routes for recruitment form submission and duplicate checking
router.post("/", saveApplicant);
router.get("/public-check", getPublicEntries);

// Protected admin routes
router.get("/", authenticate, getApplicants);
router.patch("/bulk-status", authenticate, bulkUpdateApplicantStatus);
router.patch("/:id/status", authenticate, updateApplicantStatus);
router.patch("/:id/deactivate", authenticate, requireSuperAdmin, deactivateApplicant);

module.exports = router;
