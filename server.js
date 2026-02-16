import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./src/routes/auth.routes.js";
import applicationRoutes from "./src/routes/application.routes.js";

dotenv.config();

const app = express();

// 🔹 Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ STATIC FILES (FIXED PATH)
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads")) // ✅ FIXED
);

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// ✅ Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
