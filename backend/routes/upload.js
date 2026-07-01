const express = require("express");
const multer = require("multer");
const { uploadPdf } = require("../lib/claudeClient");
const { createSession } = require("../lib/sessionStore");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB — alcance del MVP: solo PDF
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Solo se aceptan archivos PDF"));
    }
    cb(null, true);
  },
});

router.post("/", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ningún archivo" });
    }
    const fileId = await uploadPdf(req.file.buffer, req.file.originalname);
    const sessionId = createSession(fileId);
    res.json({ fileId, sessionId });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
