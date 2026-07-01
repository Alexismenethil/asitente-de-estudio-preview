import "./globals.css";
import { AppStateProvider } from "@/context/AppStateContext";

export const metadata = {
  title: "TutorPDF",
  description: "Asistente de Estudio IA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#F7F4EE]">
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
