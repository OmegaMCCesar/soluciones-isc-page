import Link from "next/link";

export default function CTA() {
  return (
    <div className="bg-black text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h3 className="text-2xl font-bold mb-4">
          ¿Necesitas servicio técnico confiable?
        </h3>
        <p className="text-gray-300 mb-6">
          Agenda tu diagnóstico con técnicos profesionales.
        </p>
        <Link
          href="/contacto"
          className="bg-white text-black px-6 py-3 rounded font-medium"
        >
          Contactar ahora
        </Link>
      </div>
    </div>
  );
}
