"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="font-bold text-lg text-black">
          Soluciones ISC
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-700">
          <Link href="/" className="hover:text-black">Inicio</Link>
          <Link href="/servicios" className="hover:text-black">Servicios</Link>
          <Link href="/nosotros" className="hover:text-black">Nosotros</Link>
          <Link
            href="/contacto"
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
          >
            Contacto
          </Link>
        </nav>

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden text-black"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-white border-t shadow-sm">
          <nav className="flex flex-col px-6 py-4 space-y-4 text-sm font-medium">
            <Link href="/" onClick={() => setOpen(false)}>Inicio</Link>
            <Link href="/servicios" onClick={() => setOpen(false)}>Servicios</Link>
            <Link href="/nosotros" onClick={() => setOpen(false)}>Nosotros</Link>
            <Link
              href="/contacto"
              onClick={() => setOpen(false)}
              className="bg-black text-white text-center py-2 rounded-md"
            >
              Contacto
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
