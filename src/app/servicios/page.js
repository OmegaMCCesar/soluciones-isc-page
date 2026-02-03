import {
  Refrigerator,
  WashingMachine,
  Wrench,
  ShieldCheck,
} from "lucide-react";

export default function Servicios() {
  const servicios = [
    {
      titulo: "Refrigeradores",
      descripcion:
        "Diagnóstico, reparación y mantenimiento en equipos domésticos y comerciales.",
      icono: Refrigerator,
    },
    {
      titulo: "Lavadoras y Secadoras",
      descripcion:
        "Atención a lavadoras, secadoras y lavasecadoras de carga frontal y superior.",
      icono: WashingMachine,
    },
    {
      titulo: "Mantenimiento Preventivo",
      descripcion:
        "Prevención de fallas, limpieza técnica y revisión completa del equipo.",
      icono: ShieldCheck,
    },
    {
      titulo: "Diagnóstico Técnico",
      descripcion:
        "Evaluación profesional con equipo especializado y reporte claro.",
      icono: Wrench,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold mb-4 text-black">
        Nuestros Servicios
      </h2>

      <p className="text-gray-600 max-w-2xl mb-12">
        Centro de servicio autorizado Samsung. También atendemos otras marcas
        bajo los mismos estándares de calidad y garantía.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {servicios.map(({ titulo, descripcion, icono: Icon }) => (
          <div
            key={titulo}
            className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition bg-white"
          >
            <Icon className="w-8 h-8 mb-4 text-black" />

            <h3 className="font-semibold text-lg mb-2">{titulo}</h3>

            <p className="text-sm text-gray-600">{descripcion}</p>
          </div>
        ))}
      </div>

      {/* Mensaje de garantía */}
      <div className="mt-16 border-t pt-8 text-center">
        <p className="text-gray-700 flex items-center justify-center gap-2">
          <ShieldCheck className="w-5 h-5 text-black" />
          Todos nuestros servicios incluyen garantía por escrito.
        </p>
      </div>
    </section>
  );
}
