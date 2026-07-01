const { randomUUID } = require("crypto");

// Historial de chat en memoria:
// sessionId -> { fileUri, mimeType, textoPlano, mensajes }
// textoPlano es el texto del PDF extraído localmente (con marcadores de
// página) — se usa solo si hay que caer al respaldo con Ollama.
// No hay persistencia — si el backend se reinicia, las sesiones se pierden.
const sessions = new Map();

function createSession({ fileUri, mimeType, textoPlano }) {
  const sessionId = randomUUID();
  sessions.set(sessionId, { fileUri, mimeType, textoPlano, mensajes: [] });
  return sessionId;
}

function getSession(sessionId) {
  return sessions.get(sessionId);
}

// El historial se guarda ya en el formato "contents" de Gemini (role/parts,
// con "model" en vez de "assistant") para poder spread-earlo directo dentro
// de generateContent() sin transformarlo en cada llamada.
function appendMessages(sessionId, pregunta, respuesta) {
  const session = sessions.get(sessionId);
  if (!session) return;
  session.mensajes.push(
    { role: "user", parts: [{ text: pregunta }] },
    { role: "model", parts: [{ text: respuesta }] }
  );
}

module.exports = { createSession, getSession, appendMessages };
