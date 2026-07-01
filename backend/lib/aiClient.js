const { GoogleGenAI } = require("@google/genai");
const { TUTOR_SYSTEM_PROMPT } = require("../prompts/tutorSystemPrompt");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 20000;

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

async function askTutor({ fileUri, mimeType, pregunta, historial }) {
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
  const respuesta = response.text;
  return { respuesta, citas: [] };
}

module.exports = { uploadPdf, askTutor };
