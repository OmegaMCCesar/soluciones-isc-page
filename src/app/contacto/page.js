export default function Contacto() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 space-y-10">
      <div>
        <h2 className="text-3xl font-bold mb-4">Contacto</h2>
        <p className="text-gray-600">
          Agenda tu servicio o visítanos directamente.
        </p>

        <div className="mt-6 space-y-2 text-sm">
          <p>📞 Teléfono: 33 1593 9299</p>
          <p>📞 Teléfono: 33 3122 3063</p>
          <p>📍 Dirección: Calle Fidias, Diag. San Jorge 175, 44690 Guadalajara, Jal.</p>
          <p>⏰ Horario: Lunes a Sábado 9:00 – 18:00</p>
        </div>
      </div>

      {/* MAPA */}
      <div className="w-full h-[420px] rounded-xl overflow-hidden border shadow-sm">
  <iframe
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3732.782412427556!2d-103.39745732492912!3d20.67842948088471!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8428ae63be5bd223%3A0x60f8fd52d10e49d0!2sSOLUCIONES%20ISC!5e0!3m2!1ses-419!2smx!4v1770089696322!5m2!1ses-419!2smx"
    className="w-full h-full"
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    allowFullScreen
  ></iframe>
</div>
    </section>
  );
}
