const express = require("express");
const { askTutor } = require("../lib/claudeClient");
const { getSession, appendMessages } = require("../lib/sessionStore");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { sessionId, pregunta } = req.body;
    if (!sessionId || !pregunta) {
      return res.status(400).json({ error: "Falta sessionId o pregunta" });
    }

    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Sesión no encontrada" });
    }

    const { respuesta, citas } = await askTutor({
      fileId: session.fileId,
      pregunta,
      historial: session.mensajes,
    });

    appendMessages(sessionId, pregunta, respuesta);
    res.json({ respuesta, citas });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
