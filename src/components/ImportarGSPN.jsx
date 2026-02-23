'use client';

import { useState } from 'react';
import { crearODSDesdeGSPN, parsearGSPN } from '@/lib/firestore';

export default function ImportarGSPN({ onSuccess }) {
  const [mostrar, setMostrar] = useState(false);
  const [textoGSPN, setTextoGSPN] = useState('');
  const [loading, setLoading] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState(null);

  const handleParsear = () => {
    if (!textoGSPN.trim()) {
      alert('Pega los datos de GSPN primero');
      return;
    }
    
    try {
      // Extraemos los datos para ver cómo quedaron
      const datosExtraidos = parsearGSPN(textoGSPN);
      // Los convertimos a texto formateado para que puedas verlos en pantalla
      setVistaPrevia(JSON.stringify(datosExtraidos, null, 2));
    } catch (error) {
      alert('Error al intentar leer los datos de GSPN.');
    }
  };

  const handleImportar = async () => {
    if (!textoGSPN.trim()) {
      alert('Pega los datos de GSPN primero');
      return;
    }

    setLoading(true);
    try {
      await crearODSDesdeGSPN(textoGSPN);
      setTextoGSPN('');
      setVistaPrevia(null);
      setMostrar(false);
      if (onSuccess) onSuccess();
      alert('Orden importada correctamente');
    } catch (error) {
      alert('Error al importar la orden');
    } finally {
      setLoading(false);
    }
  };

  if (!mostrar) {
    return (
      <button
        onClick={() => setMostrar(true)}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
      >
        + Importar desde GSPN
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Importar ODS desde GSPN</h2>
          <button
            onClick={() => setMostrar(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pega los datos de GSPN:
          </label>
          <textarea
            value={textoGSPN}
            onChange={(e) => setTextoGSPN(e.target.value)}
            rows="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
            placeholder="Pega aquí el contenido de la orden desde GSPN..."
          />
        </div>

        {vistaPrevia && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Vista Previa:</h3>
            <p className="text-sm text-gray-600">{vistaPrevia}</p>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            onClick={() => setMostrar(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleParsear}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Parsear
          </button>
          <button
            onClick={handleImportar}
            disabled={loading || !textoGSPN.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
          >
            {loading ? 'Importando...' : 'Importar Orden'}
          </button>
        </div>
      </div>
    </div>
  );
}