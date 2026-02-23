"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ChatWidget from "@/components/ChatWidget";

export default function GlobalUI({ children }) {
  const pathname = usePathname();
  
  // Verificamos si la URL actual es parte del sistema administrativo
  const isAppSystem = pathname.startsWith("/admin") || pathname.startsWith("/login");

  // Si estamos en Admin o Login, SOLO devolvemos el contenido puro
  // Sin Header, sin Footer y sin botones flotantes
  if (isAppSystem) {
    return <main className="flex-1 bg-gray-50">{children}</main>;
  }

  // Si es un cliente normal navegando por la web, mostramos todo
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <WhatsAppButton />
      <ChatWidget />
      <Footer />
    </>
  );
}