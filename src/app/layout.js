import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ChatWidget from "@/components/ChatWidget";


export const metadata = {
  title: "Soluciones ISC | Centro de Servicio Autorizado Samsung",
  description: "Centro de Servicio Autorizado Samsung en Línea Blanca",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <WhatsAppButton />
        <ChatWidget />
        <Footer />
      </body>
    </html>
  );
}
