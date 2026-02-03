import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Soluciones ISC.
            </h2>
            <p className="text-gray-300 mb-6">
              Centro de Servicio Autorizado Samsung con atención profesional
              multimarca en línea blanca.
            </p>
            <div className="flex gap-4">
              <Link
                href="/contacto"
                className="bg-white text-black px-6 py-3 rounded font-medium"
              >
                Agendar servicio
              </Link>
              <Link
                href="/servicios"
                className="border border-white px-6 py-3 rounded"
              >
                Ver servicios
              </Link>
            </div>
          </div>

          <div className="bg-white text-black p-6 rounded-lg shadow">
            <ul className="space-y-3 text-sm">
              <li>✔ Técnicos certificados</li>
              <li>✔ Garantía por escrito</li>
              <li>✔ Servicio a domicilio</li>
              <li>✔ Atención rápida y profesional</li>
            </ul>
          </div>
        </div>
      </section>

      {/* MARCAS */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-2xl font-bold mb-6">
          Marcas que atendemos
        </h3>
        <p className="text-gray-600 mb-8">
          Somos centro autorizado Samsung y brindamos servicio profesional a otras marcas líderes.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-sm">
          {["Samsung", "LG", "Whirlpool", "Mabe", "GE", "Daewoo", "Maytag", "Frigidaire"].map(
            (marca) => (
              <div
                key={marca}
                className="border rounded-lg py-4 font-medium"
              >
                {marca}
              </div>
            )
          )}
        </div>
      </section>
    </>
  );
}
