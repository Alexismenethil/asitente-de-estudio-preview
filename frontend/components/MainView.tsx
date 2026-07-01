"use client";

import { useEffect } from "react";
import { useAppState } from "@/context/AppStateContext";
import BottomNav from "@/components/BottomNav";
import ChatPanel from "@/components/ChatPanel";
import PdfViewer from "@/components/PdfViewer";

export default function MainView() {
  const { activeView } = useAppState();

  useEffect(() => {
    if (activeView !== "chat") return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeView]);

  return (
    <div className="relative h-screen w-screen overflow-hidden px-4 py-4 sm:px-8 sm:py-8">
      <PdfViewer />
      <BottomNav />
      {activeView === "chat" && <ChatPanel />}
    </div>
  );
}
