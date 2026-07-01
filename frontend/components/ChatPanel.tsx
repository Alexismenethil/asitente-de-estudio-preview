"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { useAppState } from "@/context/AppStateContext";
import { BrandCloudIcon, CloseIcon, SendIcon } from "@/components/icons";
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
  const canSend = input.trim().length > 0 && Boolean(sessionId) && !isSending;

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
    <div className="modal-fade-in fixed inset-0 z-50 flex items-center justify-center bg-[#f7f3ec]/86 px-4 py-5 backdrop-blur-sm sm:px-6">
      <section className="panel-in flex h-full max-h-[780px] w-full max-w-[760px] flex-col rounded-[34px] bg-white p-5 shadow-[0_28px_80px_rgba(31,35,45,0.14)] ring-1 ring-white/80 sm:p-7">
        <header className="flex items-center justify-between border-b border-[#f1eee8] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f1fb] text-[#0b66c3] shadow-[0_10px_24px_rgba(31,35,45,0.06)]">
              <BrandCloudIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[18px] font-semibold text-[#333844]">TutorPDF</p>
              <p className="mt-0.5 text-[13px] text-[#8b93a4]">Asistente de estudio</p>
            </div>
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

        <div ref={scrollRef} className="soft-scrollbar flex-1 space-y-4 overflow-y-auto px-1 py-6 sm:px-3">
          <div className="message-in-left max-w-[88%] rounded-[22px] bg-white px-5 py-4 text-[16px] leading-7 text-[#2e333d] shadow-[0_8px_24px_rgba(31,35,45,0.06)] ring-1 ring-black/[0.03] sm:max-w-[72%]">
            Hola, soy TutorPDF, un asistente de IA que esta listo para ayudar con tu estudio.
          </div>

          {mensajes.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[88%] rounded-[22px] px-5 py-4 text-[16px] leading-7 shadow-[0_8px_24px_rgba(31,35,45,0.08)] sm:max-w-[72%] ${
                  msg.role === "user" ? "bg-[#0b66c3] text-white" : "bg-white text-[#2e333d] ring-1 ring-black/[0.03]"
                } ${msg.role === "user" ? "message-in-right" : "message-in-left"}`}
              >
                {msg.role === "assistant" ? renderWithCitations(msg.content, goToPage) : msg.content}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="message-in-left flex justify-start">
              <div className="flex items-center gap-1.5 rounded-full bg-white px-4 py-3 shadow-[0_8px_24px_rgba(31,35,45,0.06)] ring-1 ring-black/[0.03]">
                <span className="typing-dot h-2 w-2 rounded-full bg-[#9aa1af]" />
                <span className="typing-dot h-2 w-2 rounded-full bg-[#9aa1af] [animation-delay:140ms]" />
                <span className="typing-dot h-2 w-2 rounded-full bg-[#9aa1af] [animation-delay:280ms]" />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[#d6dbe5] bg-white p-2 shadow-[0_10px_26px_rgba(31,35,45,0.07)] transition-all duration-300 ease-[var(--premium-ease)] focus-within:border-[#0b66c3]/50 focus-within:shadow-[0_14px_34px_rgba(11,102,195,0.12)]">
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
            disabled={!canSend}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0b66c3] text-white shadow-[0_10px_24px_rgba(11,102,195,0.24)] transition-all duration-300 ease-[var(--premium-ease)] hover:-translate-y-0.5 hover:bg-[#075cb2] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <SendIcon className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
