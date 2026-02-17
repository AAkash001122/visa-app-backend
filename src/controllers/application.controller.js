import db from "../../db.js";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

/* CREATE */
export const createApplication = (req, res) => {
  const {
    name,
    email,
    phone,
    nationality,
    dob,
    gender,
    state,
    city,
    issuingCountry,
    issueDate,
    applyDate
  } = req.body;

  const sql = `
    INSERT INTO applications 
    (name, email, phone, nationality, dob, gender, state, city, issuingCountry, issueDate, applyDate,
     passportFile, aadhaarFile, panFile, photoFile, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
  `;

  db.query(sql, [
    name,
    email,
    phone,
    nationality,
    dob,
    gender,
    state,
    city,
    issuingCountry,
    issueDate,
    applyDate,
    req.files?.passportFile?.[0]?.filename || null,
    req.files?.aadhaarFile?.[0]?.filename || null,
    req.files?.panFile?.[0]?.filename || null,
    req.files?.photoFile?.[0]?.filename || null
  ], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Application Submitted", id: result.insertId });
  });
};

/* GET ALL */
export const getApplications = (req, res) => {
  db.query("SELECT * FROM applications", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

/* GET ONE */
export const getApplicationById = (req, res) => {
  db.query("SELECT * FROM applications WHERE id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results[0]);
  });
};

/* UPDATE */
export const updateApplication = (req, res) => {
  const updateData = { ...req.body };

  if (req.files?.passportFile)
    updateData.passportFile = req.files.passportFile[0].filename;
  if (req.files?.aadhaarFile)
    updateData.aadhaarFile = req.files.aadhaarFile[0].filename;
  if (req.files?.panFile)
    updateData.panFile = req.files.panFile[0].filename;
  if (req.files?.photoFile)
    updateData.photoFile = req.files.photoFile[0].filename;

  db.query("UPDATE applications SET ? WHERE id = ?", 
    [updateData, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Updated Successfully" });
    });
};

/* APPROVE */
export const approveApplication = (req, res) => {
  db.query("UPDATE applications SET status='Approved' WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Approved" });
    });
};

/* REJECT */
export const rejectApplication = (req, res) => {
  db.query("UPDATE applications SET status='Rejected' WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Rejected" });
    });
};

/* DOWNLOAD VISA */
export const downloadVisa = (req, res) => {
  db.query("SELECT * FROM applications WHERE id=?", 
    [req.params.id],
    async (err, results) => {
      if (err || results.length === 0)
        return res.status(404).json({ message: "Not found" });

      const app = results[0];

      if (app.status !== "Approved")
        return res.status(403).json({ message: "Not approved" });

      const doc = new PDFDocument({ size: [350, 220], margin: 10 });
      res.setHeader("Content-Disposition", `attachment; filename=VISA-${app.phone}.pdf`);
      res.setHeader("Content-Type", "application/pdf");

      doc.pipe(res);

      doc.rect(0, 0, 350, 30).fill("#0b5394");
      doc.fillColor("white").fontSize(10)
         .text("GOVERNMENT OF INDIA - ELECTRONIC VISA", 10, 10);

      doc.fillColor("black").fontSize(8);
      doc.text(`Name: ${app.name}`, 10, 45);
      doc.text(`Phone: ${app.phone}`, 10, 65);
      doc.text(`Nationality: ${app.nationality}`, 10, 85);
      doc.text(`Email: ${app.email}`, 10, 105);

      const qr = await QRCode.toDataURL(`${app.name} | ${app.phone} | APPROVED`);
      doc.image(qr, 230, 55, { width: 70 });

      doc.fillColor("green").fontSize(9)
         .text("STATUS: APPROVED", 10, 195);

      doc.end();
    });
};
