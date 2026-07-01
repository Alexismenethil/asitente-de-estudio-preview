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
  clearTargetPage: () => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  setTotalPages: (pages: number) => void;
  mensajes: ChatMessage[];
  setMensajes: Dispatch<SetStateAction<ChatMessage[]>>;
  resetStudyState: () => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<ActiveView>("upload");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [targetPage, setTargetPage] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [mensajes, setMensajes] = useState<ChatMessage[]>([]);

  // Cruza el límite entre pestañas: usado por las citas [pág. N] del chat
  // para cambiar a "Ver Contenido" y hacer scroll a la página citada.
  function goToPage(page: number) {
    setActiveView("content");
    setTargetPage(page);
  }

  function clearTargetPage() {
    setTargetPage(null);
  }

  function resetStudyState() {
    setPdfFile(null);
    setSessionId(null);
    setTargetPage(null);
    setCurrentPage(1);
    setTotalPages(0);
    setMensajes([]);
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
        clearTargetPage,
        currentPage,
        setCurrentPage,
        totalPages,
        setTotalPages,
        mensajes,
        setMensajes,
        resetStudyState,
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
