"use client";

import { useAppState, type ActiveView } from "@/context/AppStateContext";

const TABS: { key: ActiveView; label: string }[] = [
  { key: "upload", label: "Subir Archivo" },
  { key: "content", label: "Ver Contenido" },
  { key: "chat", label: "Hablar con Asistente" },
];

export default function BottomNav() {
  const { activeView, setActiveView } = useAppState();

  return (
    <nav className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-2 rounded-full bg-white p-2 shadow-lg">
      {TABS.map((tab) => {
        const isActive = activeView === tab.key;
        const isChat = tab.key === "chat";
        return (
          <button
            key={tab.key}
            onClick={() => setActiveView(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isChat
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : isActive
                ? "bg-gray-200 text-gray-900"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
