"use client";

import { useEffect, useState } from "react";
import { useAppState, type ActiveView } from "@/context/AppStateContext";
import { ChatIcon, CloseIcon, DocumentIcon, UploadArrowIcon } from "@/components/icons";

const TABS: { key: ActiveView; label: string; icon: typeof UploadArrowIcon }[] = [
  { key: "upload", label: "Subir Archivo", icon: UploadArrowIcon },
  { key: "content", label: "Ver Contenido", icon: DocumentIcon },
  { key: "chat", label: "Hablar con Asistente", icon: ChatIcon },
];

export default function BottomNav() {
  const { activeView, pdfFile, setActiveView } = useAppState();
  const [showChangeFileDialog, setShowChangeFileDialog] = useState(false);

  useEffect(() => {
    if (!showChangeFileDialog) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowChangeFileDialog(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showChangeFileDialog]);

  function handleTabClick(view: ActiveView) {
    if (view === "upload" && pdfFile) {
      setShowChangeFileDialog(true);
      return;
    }

    setActiveView(view);
  }

  return (
    <>
      <nav className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/88 p-2 shadow-[0_18px_55px_rgba(31,35,45,0.16)] ring-1 ring-black/[0.04] backdrop-blur-xl transition-all duration-300 ease-[var(--premium-ease)]">
        {TABS.map((tab) => {
          const isActive = activeView === tab.key;
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabClick(tab.key)}
              className={`group flex min-h-[58px] items-center justify-center gap-3 rounded-full px-5 text-[15px] font-medium transition-all duration-300 ease-[var(--premium-ease)] hover:-translate-y-0.5 active:scale-[0.97] sm:px-7 ${
                isActive
                  ? "bg-[#0b66c3] text-white shadow-[0_12px_30px_rgba(11,102,195,0.26)]"
                  : "bg-white/70 text-[#262a33] shadow-[inset_0_0_0_1px_rgba(31,35,45,0.04)] hover:bg-[#f6f7f9]"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0 transition-transform duration-300 ease-[var(--premium-ease)] group-hover:scale-105" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {showChangeFileDialog && (
        <div
          className="modal-fade-in fixed inset-0 z-50 flex items-center justify-center bg-[#f7f3ec]/82 px-5 backdrop-blur-sm"
          onClick={() => setShowChangeFileDialog(false)}
        >
          <section
            className="panel-in w-full max-w-[390px] rounded-[28px] bg-white p-6 text-center shadow-[0_24px_70px_rgba(31,35,45,0.16)] ring-1 ring-black/[0.04]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Cerrar"
              title="Cerrar"
              onClick={() => setShowChangeFileDialog(false)}
              className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-[#8b93a4] transition-colors hover:bg-[#f3f4f7] hover:text-[#333844]"
            >
              <CloseIcon className="h-4 w-4" />
            </button>

            <div className="mx-auto mt-1 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f1fb] text-[#0b66c3]">
              <UploadArrowIcon className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-[22px] font-semibold text-[#17181c]">¿Estas seguro?</h2>
            <p className="mx-auto mt-3 max-w-[280px] text-[15px] leading-6 text-[#666d7c]">
              Al cambiar de archivo se cerrara el documento actual y podras subir otro material.
            </p>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setShowChangeFileDialog(false)}
                className="min-h-12 flex-1 rounded-full bg-[#f3f4f7] px-5 text-[15px] font-semibold text-[#4f5665] transition-all duration-300 ease-[var(--premium-ease)] hover:-translate-y-0.5 hover:bg-[#eceff4] active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowChangeFileDialog(false);
                  setActiveView("upload");
                }}
                className="min-h-12 flex-1 rounded-full bg-[#0b66c3] px-5 text-[15px] font-semibold text-white shadow-[0_12px_28px_rgba(11,102,195,0.22)] transition-all duration-300 ease-[var(--premium-ease)] hover:-translate-y-0.5 hover:bg-[#075cb2] active:scale-[0.98]"
              >
                Cambiar
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
