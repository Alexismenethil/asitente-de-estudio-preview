"use client";

import { useAppState } from "@/context/AppStateContext";
import PdfViewer from "@/components/PdfViewer";
import BottomNav from "@/components/BottomNav";
import ChatPanel from "@/components/ChatPanel";

export default function MainView() {
  const { activeView } = useAppState();

  return (
    <div className="relative h-screen w-screen">
      <PdfViewer />
      <BottomNav />
      {activeView === "chat" && <ChatPanel />}
    </div>
  );
}
