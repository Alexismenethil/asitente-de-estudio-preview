"use client";

import { useAppState, type ActiveView } from "@/context/AppStateContext";
import { ChatIcon, DocumentIcon, UploadArrowIcon } from "@/components/icons";

const TABS: { key: ActiveView; label: string; icon: typeof UploadArrowIcon }[] = [
  { key: "upload", label: "Subir Archivo", icon: UploadArrowIcon },
  { key: "content", label: "Ver Contenido", icon: DocumentIcon },
  { key: "chat", label: "Hablar con Asistente", icon: ChatIcon },
];

export default function BottomNav() {
  const { activeView, setActiveView } = useAppState();

  return (
    <nav className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/88 p-2 shadow-[0_18px_55px_rgba(31,35,45,0.16)] ring-1 ring-black/[0.04] backdrop-blur-xl">
      {TABS.map((tab) => {
        const isActive = activeView === tab.key;
        const Icon = tab.icon;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveView(tab.key)}
            className={`flex min-h-[58px] items-center justify-center gap-3 rounded-full px-5 text-[15px] font-medium transition-all duration-300 ease-[var(--premium-ease)] sm:px-7 ${
              isActive
                ? "bg-[#0b66c3] text-white shadow-[0_12px_30px_rgba(11,102,195,0.26)]"
                : "bg-white/70 text-[#262a33] shadow-[inset_0_0_0_1px_rgba(31,35,45,0.04)] hover:bg-[#f6f7f9]"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
