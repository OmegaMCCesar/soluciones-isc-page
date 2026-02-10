import Image from "next/image"

export default function Nosotros() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        
        {/* Texto */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Más de 10 años cuidando lo que usas todos los días
          </h2>

          <p className="text-gray-700 mb-4 leading-relaxed">
            En <strong>Soluciones ISC</strong> nacimos con una idea simple pero
            firme: brindar un servicio técnico honesto, profesional y humano.
            Desde hace más de una década ayudamos a familias y empresas a
            recuperar sus equipos Samsung con la tranquilidad de estar en manos
            expertas.
          </p>

          <p className="text-gray-700 mb-6 leading-relaxed">
            No creemos en soluciones rápidas ni en promesas vacías. Creemos en
            hacer el trabajo bien hecho, en explicar con claridad cada reparación
            y en mantener los valores que nos han acompañado desde el primer día:
            <strong> honestidad, transparencia y compromiso</strong>.
          </p>

          <ul className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="text-green-600 text-lg">✔</span>
              Técnicos certificados por Samsung
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600 text-lg">✔</span>
              Atención profesional a domicilio
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600 text-lg">✔</span>
              Más de 10 años de experiencia real
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600 text-lg">✔</span>
              Centro de Servicio Autorizado Samsung
            </li>
          </ul>
        </div>

        {/* Imagen */}
        <div className="relative w-full h-80 md:h-105 rounded-2xl overflow-hidden shadow-lg">
          <Image
            src="/images/proceso/isc-servicio.jpg"
            alt="Centro de Servicio Autorizado Samsung ISC"
            fill
            className="object-cover"
            priority
          />
        </div>

      </div>
    </section>
  )
}
