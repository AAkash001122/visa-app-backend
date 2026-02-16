import Application from "../models/Application.model.js";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

/* CREATE */
export const createApplication = async (req, res) => {
  try {
    const { name, email, passport, nationality } = req.body;

    const app = new Application({
      name,
      email,
      passport,
      nationality,
      passportFile: req.files?.passportFile?.[0]?.filename || null,
      aadhaarFile: req.files?.aadhaarFile?.[0]?.filename || null,
      panFile: req.files?.panFile?.[0]?.filename || null,
      photoFile: req.files?.photoFile?.[0]?.filename || null,
      status: "Pending",
    });

    await app.save();
    res.status(201).json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET ALL */
export const getApplications = async (req, res) => {
  const apps = await Application.find();
  res.json(apps);
};

/* GET ONE */
export const getApplicationById = async (req, res) => {
  const app = await Application.findById(req.params.id);
  res.json(app);
};

/* UPDATE (🔥 THIS FIXES EDIT ISSUE 🔥) */
export const updateApplication = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      email: req.body.email,
      passport: req.body.passport,
      nationality: req.body.nationality,
    };

    if (req.files?.passportFile)
      updateData.passportFile = req.files.passportFile[0].filename;

    if (req.files?.aadhaarFile)
      updateData.aadhaarFile = req.files.aadhaarFile[0].filename;

    if (req.files?.panFile)
      updateData.panFile = req.files.panFile[0].filename;

    if (req.files?.photoFile)
      updateData.photoFile = req.files.photoFile[0].filename;

    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

/* APPROVE */
export const approveApplication = async (req, res) => {
  const app = await Application.findByIdAndUpdate(
    req.params.id,
    { status: "Approved" },
    { new: true }
  );
  res.json(app);
};

/* REJECT */
export const rejectApplication = async (req, res) => {
  const app = await Application.findByIdAndUpdate(
    req.params.id,
    { status: "Rejected" },
    { new: true }
  );
  res.json(app);
};

/* DOWNLOAD VISA */
export const downloadVisa = async (req, res) => {
  const app = await Application.findById(req.params.id);

  if (!app || app.status !== "Approved") {
    return res.status(403).json({ message: "Not approved" });
  }

  const doc = new PDFDocument({ size: [350, 220], margin: 10 });

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=VISA-${app.passport}.pdf`
  );
  res.setHeader("Content-Type", "application/pdf");

  doc.pipe(res);

  doc.rect(0, 0, 350, 30).fill("#0b5394");
  doc.fillColor("white").fontSize(10)
    .text("GOVERNMENT OF INDIA - ELECTRONIC VISA", 10, 10);

  doc.fillColor("black").fontSize(8);

  doc.text(`Name: ${app.name}`, 10, 45);
  doc.text(`Passport: ${app.passport}`, 10, 65);
  doc.text(`Nationality: ${app.nationality}`, 10, 85);
  doc.text(`Email: ${app.email}`, 10, 105);

  if (app.photoFile) {
    doc.image(`src/uploads/${app.photoFile}`, 130, 45, {
      width: 70,
      height: 90,
    });
  }

  const qr = await QRCode.toDataURL(
    `${app.name} | ${app.passport} | APPROVED`
  );
  doc.image(qr, 230, 55, { width: 70 });

  doc.fillColor("green").fontSize(9)
    .text("STATUS: APPROVED", 10, 195);

  doc.end();
};
