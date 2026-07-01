import "./globals.css";
import { AppStateProvider } from "@/context/AppStateContext";

export const metadata = {
  title: "TutorPDF",
  description: "Un espacio limpio y fluido para estudiar con ayuda de IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-transparent text-[#17181c] antialiased">
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
