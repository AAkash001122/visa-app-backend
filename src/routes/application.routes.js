import express from "express";
import multer from "multer";
import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  approveApplication,
  rejectApplication,
  downloadVisa
} from "../controllers/application.controller.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// Routes
router.post("/", upload.fields([
  { name: "passportFile" },
  { name: "aadhaarFile" },
  { name: "panFile" },
  { name: "photoFile" }
]), createApplication);

router.get("/", getApplications);
router.get("/:id", getApplicationById);
router.put("/:id", upload.fields([
  { name: "passportFile" },
  { name: "aadhaarFile" },
  { name: "panFile" },
  { name: "photoFile" }
]), updateApplication);

router.put("/:id/approve", approveApplication);
router.put("/:id/reject", rejectApplication);
router.get("/:id/download-visa", downloadVisa);

export default router;
