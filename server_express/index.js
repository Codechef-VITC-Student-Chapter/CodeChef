require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const existingRouter = require("./routes/router");
const authRouter = require("./routes/authRouter");
const applicantRouter = require("./routes/applicantRouter");
const { ensureSuperAdmin } = require("./controllers/authController");

const app = express();
const PORT = process.env.PORT || 4002;

// 1. Request logging middleware (sanitized, zero sensitive data)
app.use((req, res, next) => {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color =
      status >= 500
        ? "\x1b[31m"
        : status >= 400
        ? "\x1b[33m"
        : status >= 300
        ? "\x1b[36m"
        : "\x1b[32m";
    const reset = "\x1b[0m";
    const dim = "\x1b[2m";
    const bold = "\x1b[1m";
    const time = new Date().toLocaleTimeString("en-GB", { hour12: false });

    console.log(
      `${dim}[${time}]${reset} \x1b[35m[Express]${reset} ${bold}${method.padEnd(6)}${reset} ${originalUrl} ${color}${status}${reset} - ${dim}${duration}ms${reset}`
    );
  });

  next();
});

// 2. Body parser & CORS
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3001",
      "https://codechef-vitcc.com",
      "https://codechefvitc.in"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 3. API Routers
app.use("/api/auth", authRouter);
app.use("/api/applicants", applicantRouter);
app.use(existingRouter);

app.get("/", (req, res) => res.json({ status: "Server working fine" }));

// 4. Database connection & Server initialization
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    await ensureSuperAdmin();
    app.listen(PORT, () => console.log(`🚀 Express server running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });
