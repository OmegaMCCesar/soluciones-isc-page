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
            Nuestro nombre no es casualidad. <strong>ISC</strong> representa los
            tres pilares que guían cada diagnóstico, cada reparación y cada
            visita a domicilio:
          </p>

          {/* Significado ISC */}
          <div className="space-y-4 mb-8">
            <div>
              <h4 className="font-semibold text-gray-900">Inteligencia</h4>
              <p className="text-sm text-gray-700">
                Analizamos cada equipo con criterio técnico, experiencia y
                diagnóstico real, evitando cambios innecesarios y soluciones
                improvisadas.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900">Servicio</h4>
              <p className="text-sm text-gray-700">
                Atendemos personas, no solo equipos. Explicamos, acompañamos y
                trabajamos con respeto en cada domicilio.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900">Compromiso</h4>
              <p className="text-sm text-gray-700">
                Cumplimos lo que prometemos. Respaldamos cada trabajo con
                responsabilidad, garantía y el aval de Samsung.
              </p>
            </div>
          </div>

          {/* Eslogan */}
          <blockquote className="border-l-4 border-black pl-4 italic text-gray-800 mb-8">
            “Soluciones ISC no repara equipos, devuelve tranquilidad.”
          </blockquote>

          <ul className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="text-green-600 text-lg">✔</span>
              Centro de Servicio Autorizado Samsung
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600 text-lg">✔</span>
              Técnicos certificados
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600 text-lg">✔</span>
              Atención profesional a domicilio
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600 text-lg">✔</span>
              Más de 10 años de experiencia comprobable
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
