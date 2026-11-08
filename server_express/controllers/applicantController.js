const Applicant = require("../models/Applicant");

const COMMON_FIELDS = [
  "name",
  "reg_no",
  "vit_email",
  "phone_no",
  "degree",
  "branch",
  "experience",
  "whyJoin",
  "department",
  "cgpa",
];

function splitData(data) {
  const common = {};
  const deptFields = {};
  for (const [key, value] of Object.entries(data)) {
    if (COMMON_FIELDS.includes(key)) {
      common[key] = value;
    } else {
      deptFields[key] = value;
    }
  }
  return { common, deptFields };
}

// Public: Save an applicant submission
const saveApplicant = async (req, res) => {
  try {
    const rawData = req.body;
    if (!rawData || !rawData.department) {
      return res.status(400).json({ error: "Missing submission data or department" });
    }
    const { common, deptFields } = splitData(rawData);

    // Prevent duplicate submission for the same reg_no + department
    if (common.reg_no && common.department) {
      const existing = await Applicant.findOne({
        reg_no: new RegExp(`^${common.reg_no.trim()}$`, "i"),
        department: common.department,
        isActive: true,
      });
      if (existing) {
        return res
          .status(409)
          .json({ error: "You have already submitted an application for this department." });
      }
    }

    const applicant = await Applicant.create({ ...common, deptFields });
    return res.status(201).json({ _id: applicant._id, message: "Application saved successfully" });
  } catch (err) {
    console.error("Save applicant error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Public: Light-weight duplicate check (returns only reg_no and department)
const getPublicEntries = async (req, res) => {
  try {
    const applicants = await Applicant.find({ isActive: true })
      .select("reg_no department")
      .lean();
    return res.status(200).json(
      applicants.map((a) => ({
        reg_no: a.reg_no,
        department: a.department,
        _sheetDepartment: a.department,
      }))
    );
  } catch (err) {
    console.error("Public check error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Authenticated: Get applicants (super_admin sees all or filtered by dept; admin sees own dept only)
const getApplicants = async (req, res) => {
  try {
    const { role, department } = req.adminUser;
    const { dept, page = 1, limit = 500 } = req.query;
    let filter = { isActive: true };

    if (role === "super_admin") {
      if (dept) filter.department = dept;
    } else {
      filter.department = department;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [applicants, total] = await Promise.all([
      Applicant.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Applicant.countDocuments(filter),
    ]);

    return res.status(200).json({ applicants, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error("Get applicants error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Authenticated (Super Admin only): Soft-delete / deactivate an applicant
const deactivateApplicant = async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) return res.status(404).json({ error: "Applicant not found" });
    applicant.isActive = false;
    await applicant.save();
    return res.status(200).json({ _id: applicant._id, isActive: false });
  } catch (err) {
    console.error("Deactivate error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { saveApplicant, getPublicEntries, getApplicants, deactivateApplicant };
