const Anthropic = require("@anthropic-ai/sdk");
const { TUTOR_SYSTEM_PROMPT } = require("../prompts/tutorSystemPrompt");

const client = new Anthropic(); // lee ANTHROPIC_API_KEY del entorno — nunca se expone al cliente

const FILES_BETA = "files-api-2025-04-14";

async function uploadPdf(fileBuffer, filename) {
  const uploaded = await client.beta.files.upload({
    file: await Anthropic.toFile(fileBuffer, filename, { type: "application/pdf" }),
    betas: [FILES_BETA],
  });
  return uploaded.id;
}

// TODO (temporal): confirmar en vivo el shape crudo de las citas del SDK
// antes de construir la UI final. Quitar este log una vez confirmado.
let hasLoggedRawCitation = false;

async function askTutor({ fileId, pregunta, historial }) {
  const response = await client.beta.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    system: TUTOR_SYSTEM_PROMPT,
    betas: [FILES_BETA],
    messages: [
      ...historial,
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "file", file_id: fileId },
            citations: { enabled: true },
            cache_control: { type: "ephemeral" },
          },
          { type: "text", text: pregunta },
        ],
      },
    ],
  });

  let respuesta = "";
  const citas = [];
  const rawCitationsThisResponse = [];

  for (const block of response.content) {
    if (block.type !== "text") continue;
    respuesta += block.text;
    for (const cita of block.citations ?? []) {
      rawCitationsThisResponse.push(cita);
      if (cita.type === "page_location") {
        citas.push({ pagina: cita.start_page_number, textoCitado: cita.cited_text });
        respuesta += ` [pág. ${cita.start_page_number}]`;
      }
    }
  }

  if (!hasLoggedRawCitation && rawCitationsThisResponse.length > 0) {
    console.log(
      "[DEBUG TEMPORAL] Objeto(s) de cita crudo devuelto por el SDK:",
      JSON.stringify(rawCitationsThisResponse, null, 2)
    );
    hasLoggedRawCitation = true;
  }

  return { respuesta, citas };
}

module.exports = { uploadPdf, askTutor };
