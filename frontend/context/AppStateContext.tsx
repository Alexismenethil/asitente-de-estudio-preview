"use client";

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

export type ActiveView = "upload" | "content" | "chat";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AppState {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  pdfFile: File | null;
  setPdfFile: (file: File | null) => void;
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  targetPage: number | null;
  goToPage: (page: number) => void;
  mensajes: ChatMessage[];
  setMensajes: Dispatch<SetStateAction<ChatMessage[]>>;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<ActiveView>("upload");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [targetPage, setTargetPage] = useState<number | null>(null);
  const [mensajes, setMensajes] = useState<ChatMessage[]>([]);

  // Cruza el límite entre pestañas: usado por las citas [pág. N] del chat
  // para cambiar a "Ver Contenido" y hacer scroll a la página citada.
  function goToPage(page: number) {
    setActiveView("content");
    setTargetPage(page);
  }

  return (
    <AppStateContext.Provider
      value={{
        activeView,
        setActiveView,
        pdfFile,
        setPdfFile,
        sessionId,
        setSessionId,
        targetPage,
        goToPage,
        mensajes,
        setMensajes,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState debe usarse dentro de AppStateProvider");
  return ctx;
}
