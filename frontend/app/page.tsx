"use client";

import { useAppState } from "@/context/AppStateContext";
import UploadModal from "@/components/UploadModal";
import MainView from "@/components/MainView";

export default function Home() {
  const { activeView } = useAppState();

  if (activeView === "upload") {
    return <UploadModal />;
  }

  return <MainView />;
}
