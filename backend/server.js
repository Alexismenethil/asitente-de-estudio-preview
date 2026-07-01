require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");

const uploadRouter = require("./routes/upload");
const chatRouter = require("./routes/chat");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" })); // el PDF viaja por multipart (multer), no por JSON

app.use("/api/upload", uploadRouter);
app.use("/api/chat", chatRouter);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Manejo de errores centralizado (incluye errores de multer: tamaño/tipo de archivo)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || /PDF/.test(err.message)) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`TutorPDF backend escuchando en http://localhost:${PORT}`);
});
