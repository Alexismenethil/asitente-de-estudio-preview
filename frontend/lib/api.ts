const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

export interface Cita {
  pagina: number;
  textoCitado: string;
}

export interface ChatResponse {
  respuesta: string;
  citas: Cita[];
}

export async function uploadPdf(file: File): Promise<{ sessionId: string; fileId: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error al subir el archivo");
  }
  return res.json();
}

export async function sendChatMessage(sessionId: string, pregunta: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, pregunta }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error al procesar la pregunta");
  }
  return res.json();
}
