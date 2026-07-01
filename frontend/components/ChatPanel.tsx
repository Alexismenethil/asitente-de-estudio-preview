"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { useAppState } from "@/context/AppStateContext";
import { CloseIcon, SendIcon } from "@/components/icons";
import { sendChatMessage } from "@/lib/api";

const CITATION_REGEX = /\[pág\.\s*(\d+)\]/g;

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
        className="mx-0.5 rounded bg-[#e9f2ff] px-1.5 py-0.5 text-xs font-medium text-[#0b66c3] transition-colors hover:bg-[#dcecff]"
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
        { role: "assistant", content: "Ocurrio un error al procesar tu pregunta. Intenta de nuevo." },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f7f3ec]/86 px-5 py-6 backdrop-blur-sm">
      <section className="flex h-full max-h-[720px] w-full max-w-[430px] flex-col rounded-[34px] bg-white p-6 shadow-[0_28px_80px_rgba(31,35,45,0.14)] ring-1 ring-white/80 sm:p-7">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0b66c3] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(11,102,195,0.24)]">
              AI
            </div>
            <span className="text-[17px] font-semibold text-[#4b5262]">TutorPDF</span>
          </div>
          <button
            type="button"
            aria-label="Cerrar asistente"
            title="Cerrar"
            onClick={() => setActiveView("content")}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#7b8394] transition-colors hover:bg-[#f3f4f7] hover:text-[#333844]"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        <div ref={scrollRef} className="soft-scrollbar mt-8 flex-1 space-y-4 overflow-y-auto pr-1">
          <div className="max-w-[84%] rounded-[18px] bg-white px-5 py-4 text-[16px] leading-7 text-[#2e333d] shadow-[0_8px_24px_rgba(31,35,45,0.06)] ring-1 ring-black/[0.03]">
            Hola, soy TutorPDF, un asistente de IA que esta listo para ayudar con tu estudio.
          </div>

          {mensajes.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[84%] rounded-[18px] px-5 py-4 text-[16px] leading-7 shadow-[0_8px_24px_rgba(31,35,45,0.08)] ${
                  msg.role === "user" ? "bg-[#0b66c3] text-white" : "bg-white text-[#2e333d] ring-1 ring-black/[0.03]"
                }`}
              >
                {msg.role === "assistant" ? renderWithCitations(msg.content, goToPage) : msg.content}
              </div>
            </div>
          ))}

          {isSending && <p className="text-sm text-[#9aa1af]">Pensando...</p>}
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-full border border-[#aab3c3] bg-white p-2 shadow-[0_10px_26px_rgba(31,35,45,0.07)]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escribe tu duda aqui..."
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-[16px] text-[#333844] outline-none placeholder:text-[#9aa1af]"
          />
          <button
            type="button"
            aria-label="Enviar"
            title="Enviar"
            onClick={handleSend}
            disabled={isSending || !sessionId}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0b66c3] text-white shadow-[0_10px_24px_rgba(11,102,195,0.24)] transition-all duration-300 ease-[var(--premium-ease)] hover:-translate-y-0.5 hover:bg-[#075cb2] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <SendIcon className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
