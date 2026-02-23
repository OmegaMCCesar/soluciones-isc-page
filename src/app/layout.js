import "./globals.css";
import GlobalUI from "@/components/GlobalUI";

export const metadata = {
  title: "Soluciones ISC | Centro de Servicio Autorizado Samsung",
  description: "Centro de Servicio Autorizado Samsung en Línea Blanca",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="flex flex-col min-h-screen m-0 p-0 overflow-x-hidden">
        {/* Toda la lógica visual ahora la maneja GlobalUI */}
        <GlobalUI>
          {children}
        </GlobalUI>
      </body>
    </html>
  );
}