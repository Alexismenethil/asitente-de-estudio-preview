"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { useAppState } from "@/context/AppStateContext";
import { sendChatMessage } from "@/lib/api";

const CITATION_REGEX = /\[pág\.\s*(\d+)\]/g;

// Convierte "... [pág. 4] ..." en texto intercalado con botones clicables.
function renderWithCitations(text: string, onCiteClick: (page: number) => void) {
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  CITATION_REGEX.lastIndex = 0;

  while ((match = CITATION_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const page = parseInt(match[1], 10);
    parts.push(
      <button
        key={`${match.index}-${page}`}
        onClick={() => onCiteClick(page)}
        className="mx-0.5 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 hover:bg-blue-200"
      >
        [pág. {page}]
      </button>
    );
    lastIndex = CITATION_REGEX.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

export default function ChatPanel() {
  const { sessionId, mensajes, setMensajes, goToPage, setActiveView } = useAppState();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [mensajes]);

  async function handleSend() {
    const pregunta = input.trim();
    if (!pregunta || !sessionId || isSending) return;

    setMensajes((prev) => [...prev, { role: "user", content: pregunta }]);
    setInput("");
    setIsSending(true);

    try {
      const { respuesta } = await sendChatMessage(sessionId, pregunta);
      setMensajes((prev) => [...prev, { role: "assistant", content: respuesta }]);
    } catch (err) {
      setMensajes((prev) => [
        ...prev,
        { role: "assistant", content: "Ocurrió un error al procesar tu pregunta. Intenta de nuevo." },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            AI
          </div>
          <span className="font-semibold text-gray-900">TutorPDF</span>
        </div>
        <button onClick={() => setActiveView("content")} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        <div className="max-w-[80%] rounded-2xl bg-gray-100 p-3 text-sm text-gray-800">
          Hola, soy TutorPDF, un asistente de IA que está listo para ayudar con tu estudio.
        </div>
        {mensajes.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[80%] rounded-2xl p-3 text-sm ${
              msg.role === "user" ? "ml-auto bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
            }`}
          >
            {msg.role === "assistant" ? renderWithCitations(msg.content, goToPage) : msg.content}
          </div>
        ))}
        {isSending && <div className="text-xs text-gray-400">Pensando...</div>}
      </div>

      <div className="flex items-center gap-2 border-t p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Escribe tu duda aquí..."
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          disabled={isSending}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
