import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="space-x-6 text-sm font-medium">
      <Link href="/" className="hover:underline">Inicio</Link>
      <Link href="/servicios" className="hover:underline">Servicios</Link>
      <Link href="/nosotros" className="hover:underline">Nosotros</Link>
      <Link href="/contacto" className="hover:underline">Contacto</Link>
    </nav>
  );
}
