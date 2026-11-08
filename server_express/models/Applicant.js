const mongoose = require("mongoose");

const applicantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    reg_no: { type: String, required: true, trim: true },
    vit_email: { type: String, required: true, trim: true },
    phone_no: { type: String, required: true, trim: true },
    degree: { type: String, default: "" },
    branch: { type: String, default: "" },
    experience: { type: String, default: "" },
    whyJoin: { type: String, default: "" },
    department: { type: String, required: true },
    cgpa: { type: String, default: "" },
    deptFields: { type: mongoose.Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

applicantSchema.index({ department: 1, createdAt: -1 });
applicantSchema.index({ isActive: 1, department: 1 });

module.exports = mongoose.model("Applicant", applicantSchema);
