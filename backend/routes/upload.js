const express = require("express");
const multer = require("multer");
const { uploadPdf } = require("../lib/aiClient");
const { extractPdfText } = require("../lib/pdfText");
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
    // Sube a Gemini y extrae el texto local en paralelo — el texto queda
    // listo en la sesión ANTES de necesitarse, no se extrae recién al fallar.
    const [{ uri, mimeType }, textoPlano] = await Promise.all([
      uploadPdf(req.file.buffer, req.file.originalname),
      extractPdfText(req.file.buffer),
    ]);
    const sessionId = createSession({ fileUri: uri, mimeType, textoPlano });
    // "fileId" se mantiene como nombre de campo por compatibilidad con el
    // frontend existente, aunque ahora contiene el uri de archivo de Gemini.
    res.json({ fileId: uri, sessionId });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
