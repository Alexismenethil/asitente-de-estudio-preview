"use client";

import { useRef, useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { uploadPdf } from "@/lib/api";

const MAX_SIZE = 15 * 1024 * 1024; // 15MB

export default function UploadModal() {
  const { setPdfFile, setSessionId, setActiveView } = useAppState();
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
      setError("El archivo supera el límite de 15MB");
      return;
    }

    setIsUploading(true);
    try {
      const { sessionId } = await uploadPdf(file);
      setPdfFile(file);
      setSessionId(sessionId);
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
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
          <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m0-9l-3 3m3-3l3 3"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">TutorPDF</h1>
        <p className="mt-1 text-sm text-gray-500">Asistente de Estudio IA</p>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`mt-6 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 transition-colors ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
        >
          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <p className="text-sm text-gray-600">Suelta tus materiales de estudio aquí</p>
        </div>

        <div className="my-4 text-xs text-gray-400">o</div>

        <button
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isUploading ? "Subiendo..." : "Seleccionar Archivo"}
        </button>
        <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={onSelectFile} />

        <p className="mt-4 text-xs text-gray-400">Soporta PDF hasta 15MB</p>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
