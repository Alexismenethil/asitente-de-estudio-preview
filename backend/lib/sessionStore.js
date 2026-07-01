const { randomUUID } = require("crypto");

// Historial de chat en memoria: sessionId -> { fileId, mensajes }
// No hay persistencia — si el backend se reinicia, las sesiones se pierden.
const sessions = new Map();

function createSession(fileId) {
  const sessionId = randomUUID();
  sessions.set(sessionId, { fileId, mensajes: [] });
  return sessionId;
}

function getSession(sessionId) {
  return sessions.get(sessionId);
}

function appendMessages(sessionId, pregunta, respuesta) {
  const session = sessions.get(sessionId);
  if (!session) return;
  session.mensajes.push(
    { role: "user", content: pregunta },
    { role: "assistant", content: respuesta }
  );
}

module.exports = { createSession, getSession, appendMessages };
