import express from "express";
import multer from "multer";
import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  approveApplication,
  rejectApplication,
  downloadVisa,
} from "../controllers/application.controller.js";

const router = express.Router();

/* MULTER */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "src/uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

/* CREATE */
router.post(
  "/",
  upload.fields([
    { name: "passportFile", maxCount: 1 },
    { name: "aadhaarFile", maxCount: 1 },
    { name: "panFile", maxCount: 1 },
    { name: "photoFile", maxCount: 1 },
  ]),
  createApplication
);

/* READ */
router.get("/", getApplications);
router.get("/:id", getApplicationById);

/* UPDATE ✅ */
router.put(
  "/:id",
  upload.fields([
    { name: "passportFile", maxCount: 1 },
    { name: "aadhaarFile", maxCount: 1 },
    { name: "panFile", maxCount: 1 },
    { name: "photoFile", maxCount: 1 },
  ]),
  updateApplication
);

/* STATUS */
router.put("/:id/approve", approveApplication);
router.put("/:id/reject", rejectApplication);

/* DOWNLOAD */
router.get("/:id/download-visa", downloadVisa);

export default router;
