"use client";

import { useRef, useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { BrandCloudIcon, DocumentIcon, UploadArrowIcon } from "@/components/icons";
import { uploadPdf } from "@/lib/api";

const MAX_SIZE = 15 * 1024 * 1024; // 15MB

export default function UploadModal() {
  const { setPdfFile, setSessionId, setActiveView, setMensajes, setCurrentPage, setTotalPages } = useAppState();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);

    if (file.type !== "application/pdf") {
      setError("Solo se aceptan archivos PDF");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("El archivo supera el limite de 15MB");
      return;
    }

    setIsUploading(true);
    try {
      const { sessionId } = await uploadPdf(file);
      setPdfFile(file);
      setSessionId(sessionId);
      setMensajes([]);
      setCurrentPage(1);
      setTotalPages(0);
      setActiveView("content");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el archivo");
    } finally {
      setIsUploading(false);
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-8">
      <section className="relative w-full max-w-[430px] rounded-[34px] bg-white px-7 py-9 text-center shadow-[0_28px_80px_rgba(31,35,45,0.11)] ring-1 ring-white/80 sm:px-9 sm:py-11">
        <div className="mx-auto flex h-[74px] w-[74px] items-center justify-center rounded-full bg-[#e8f1fb] text-[#0b66c3]">
          <BrandCloudIcon className="h-9 w-9" />
        </div>

        <h1 className="mt-7 text-[2rem] font-semibold leading-none text-[#17181c]">TutorPDF</h1>
        <p className="mt-3 text-[15px] text-[#606778]">Asistente de Estudio IA</p>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`mt-8 flex min-h-[168px] flex-col items-center justify-center rounded-[24px] border-2 border-dashed px-6 py-8 transition-all duration-500 ease-[var(--premium-ease)] ${
            isDragging ? "border-[#0b66c3] bg-[#edf5ff]" : "border-[#c8d0e2] bg-white"
          }`}
        >
          <DocumentIcon className="h-9 w-9 text-[#7b8394]" />
          <p className="mt-5 text-[15px] leading-6 text-[#555c6d]">Suelta tus materiales de estudio aqui</p>
        </div>

        <div className="my-6 flex items-center justify-center gap-4 text-[13px] text-[#9aa1af]">
          <span className="h-px w-12 bg-[#edf0f4]" />
          o
          <span className="h-px w-12 bg-[#edf0f4]" />
        </div>

        <button
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="mx-auto inline-flex min-h-12 w-full max-w-[260px] items-center justify-center gap-3 rounded-full bg-[#0b66c3] px-5 text-[15px] font-semibold text-white shadow-[0_12px_28px_rgba(11,102,195,0.25)] transition-all duration-300 ease-[var(--premium-ease)] hover:-translate-y-0.5 hover:bg-[#075cb2] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UploadArrowIcon className="h-5 w-5" />
          {isUploading ? "Subiendo..." : "Seleccionar Archivo"}
        </button>
        <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={onSelectFile} />

        <p className="mt-6 text-[13px] text-[#a3aabb]">Soporta PDF hasta 15MB</p>

        {error && (
          <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}
      </section>
    </main>
  );
}
