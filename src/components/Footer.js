import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-6 text-sm">
        <div>
          <h4 className="font-semibold text-white mb-2">Soluciones ISC</h4>
          <p>
            Centro de Servicio Autorizado Samsung con atención multimarca.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-2">Enlaces</h4>
          <ul className="space-y-1">
            <li><Link href="/servicios">Servicios</Link></li>
            <li><Link href="/nosotros">Nosotros</Link></li>
            <li><Link href="/terminos">Términos</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-2">Contacto</h4>
          <p>Guadalajara, Jalisco</p>
          <p>Tel: 33 2920 8149</p>
        </div>
      </div>
    </footer>
  );
}
