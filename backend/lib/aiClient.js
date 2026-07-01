const ollama = require("ollama").default;
const { GoogleGenAI } = require("@google/genai");
const { TUTOR_SYSTEM_PROMPT } = require("../prompts/tutorSystemPrompt");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 20000;

// Respaldo local: solo qwen2.5:7b corre de verdad en este Mac. Los otros
// modelos listados en `ollama list` (glm-5:cloud, kimi-k2.5:cloud, etc.)
// son proxies a la nube de Ollama, no archivos locales — dependen de
// internet igual que Gemini, así que no sirven como respaldo de resiliencia.
const OLLAMA_MODEL = "qwen2.5:7b";

const OLLAMA_SYSTEM_PROMPT = `${TUTOR_SYSTEM_PROMPT}

El documento se te da como texto con marcadores "--- Página N ---" insertados; cita usando el formato [pág. N] basándote en esos marcadores, igual que harías con el documento original.`;

// Errores que justifican caer al respaldo local: sobrecarga temporal de
// Gemini, timeouts, o fallas de red. Errores de request mal formado, auth,
// etc. NO deben disparar el fallback — eso oculta bugs reales.
function isTransientError(err) {
  if (err?.status === 503) return true;
  const message = `${err?.message || ""} ${err?.cause?.message || ""}`.toLowerCase();
  return (
    message.includes("timeout") ||
    message.includes("fetch failed") ||
    message.includes("econnreset") ||
    message.includes("econnrefused") ||
    message.includes("enotfound")
  );
}

// Convierte el historial (guardado en formato Gemini: role "model" +
// parts[]) al formato plano {role, content} que espera ollama.chat().
function toOllamaMessages(historialGemini) {
  return historialGemini.map((turno) => ({
    role: turno.role === "model" ? "assistant" : turno.role,
    content: turno.parts.map((p) => p.text || "").join(""),
  }));
}

async function askTutorFallback({ textoPlano, pregunta, historial }) {
  // Gancho de prueba: FORCE_OLLAMA_FAILURE=true (combinado con
  // FORCE_GEMINI_FAILURE=true) simula que también falla el respaldo, para
  // probar el mensaje de error final sin apagar el servicio de Ollama real.
  if (process.env.FORCE_OLLAMA_FAILURE === "true") {
    throw new Error("Fallo simulado vía FORCE_OLLAMA_FAILURE=true");
  }

  const response = await ollama.chat({
    model: OLLAMA_MODEL,
    messages: [
      { role: "system", content: OLLAMA_SYSTEM_PROMPT },
      ...toOllamaMessages(historial),
      { role: "user", content: `Documento:\n${textoPlano}\n\nPregunta: ${pregunta}` },
    ],
  });

  return { respuesta: response.message.content, citas: [] };
}

async function waitUntilActive(fileName) {
  const start = Date.now();
  let file = await ai.files.get({ name: fileName });

  while (file.state === "PROCESSING") {
    if (Date.now() - start > POLL_TIMEOUT_MS) {
      throw new Error("Tiempo de espera agotado procesando el PDF en Gemini");
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    file = await ai.files.get({ name: fileName });
  }

  if (file.state === "FAILED") {
    throw new Error("Gemini no pudo procesar el PDF subido");
  }

  return file;
}

async function uploadPdf(fileBuffer, filename) {
  const blob = new Blob([fileBuffer], { type: "application/pdf" });
  const uploaded = await ai.files.upload({
    file: blob,
    config: { mimeType: "application/pdf", displayName: filename },
  });

  const activeFile = await waitUntilActive(uploaded.name);
  return { uri: activeFile.uri, mimeType: activeFile.mimeType };
}

async function askTutor({ fileUri, mimeType, textoPlano, pregunta, historial }) {
  try {
    // Gancho de prueba: FORCE_GEMINI_FAILURE=true dispara el fallback sin
    // esperar a que Gemini falle solo. Ver instrucciones al final del archivo.
    if (process.env.FORCE_GEMINI_FAILURE === "true") {
      const simulado = new Error("Fallo simulado vía FORCE_GEMINI_FAILURE=true");
      simulado.status = 503;
      throw simulado;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...historial,
        {
          role: "user",
          parts: [{ fileData: { fileUri, mimeType } }, { text: pregunta }],
        },
      ],
      config: { systemInstruction: TUTOR_SYSTEM_PROMPT },
    });

    // Gemini no devuelve un array de citas estructurado con este método —
    // el [pág. N] ya viene embebido en el texto porque se le pide en el
    // system prompt. citas queda vacío a propósito.
    return { respuesta: response.text, citas: [] };
  } catch (err) {
    if (!isTransientError(err)) throw err;

    console.warn(
      `[FALLBACK] Gemini falló con un error transitorio (${err.status || err.message}). Usando Ollama (${OLLAMA_MODEL}) como respaldo local.`
    );

    try {
      return await askTutorFallback({ textoPlano, pregunta, historial });
    } catch (fallbackErr) {
      console.error("[FALLBACK] Ollama también falló:", fallbackErr.message);
      const error = new Error("No se pudo procesar la pregunta, intenta de nuevo.");
      error.isFallbackFailure = true;
      throw error;
    }
  }
}

module.exports = { uploadPdf, askTutor };
