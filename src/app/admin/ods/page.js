'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { db, auth } from '@/lib/firebase'
import { Plus, Search, Eye, Edit2 } from 'lucide-react'

export default function ODSList() {
  const [ods, setOds] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // ==========================================
  // ESCUCHAR DATOS EN TIEMPO REAL
  // ==========================================
  useEffect(() => {
    let unsubscribeDb = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // CORRECCIÓN 1: Cambiamos 'createdAt' por 'fechaCreacion'
        const q = query(collection(db, 'ods'), orderBy('fechaCreacion', 'desc'))
        
        unsubscribeDb = onSnapshot(q, (snapshot) => {
          const odsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setOds(odsData)
          setLoading(false)
        }, (error) => {
          console.error("Error obteniendo ODS:", error)
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDb) {
        unsubscribeDb();
      }
    }
  }, [])

  // ==========================================
  // FILTRADO DE BÚSQUEDA
  // ==========================================
  const filteredOds = ods.filter(item => {
    const searchLower = searchTerm.toLowerCase()
    // CORRECCIÓN 2: Apuntamos a las rutas correctas (item.cliente.nombre)
    return (
      item.id.toLowerCase().includes(searchLower) ||
      item.cliente?.nombre?.toLowerCase().includes(searchLower) ||
      item.cliente?.telefono?.includes(searchLower) ||
      item.producto?.modelo?.toLowerCase().includes(searchLower) // Añadí búsqueda por modelo
    )
  })

  // ==========================================
  // HELPER PARA COLORES DE ESTADO
  // ==========================================
  const getStatusColor = (status) => {
    // Si status viene vacío, le damos uno por defecto
    const estadoActual = status?.toLowerCase() || 'pendiente';
    
    if (estadoActual.includes('pendiente')) return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    if (estadoActual.includes('progreso') || estadoActual.includes('revisión')) return 'bg-blue-50 text-blue-700 border-blue-200'
    if (estadoActual.includes('completada')) return 'bg-green-50 text-green-700 border-green-200'
    if (estadoActual.includes('espera')) return 'bg-orange-50 text-orange-700 border-orange-200'
    return 'bg-gray-50 text-gray-600 border-gray-200'
  }

  return (
    <div className="space-y-6">
      
      {/* HEADER DE LA PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Órdenes de Servicio</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona el estado y seguimiento de los equipos.
          </p>
        </div>
        <Link 
          href="/admin/ods/new" 
          className="flex items-center justify-center px-4 py-2.5 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva ODS
        </Link>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar por Folio, Nombre, Teléfono o Modelo..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none"
        />
      </div>

      {/* TABLA DE DATOS */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Folio ODS</th>
                <th className="px-6 py-4 font-semibold">Cliente</th>
                <th className="px-6 py-4 font-semibold">Modelo</th>
                <th className="px-6 py-4 font-semibold">Estado de Reparación</th>
                <th className="px-6 py-4 font-semibold">Técnico Asignado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                      Cargando órdenes...
                    </div>
                  </td>
                </tr>
              ) : filteredOds.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No se encontraron órdenes de servicio.
                  </td>
                </tr>
              ) : (
                filteredOds.map((orden) => (
                  <tr key={orden.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {orden.id}
                    </td>
                    <td className="px-6 py-4">
                      {/* CORRECCIÓN 3: Leemos desde orden.cliente */}
                      <div className="text-gray-900 font-medium">{orden.cliente?.nombre || 'Sin nombre'}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{orden.cliente?.telefono || 'Sin teléfono'}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {/* CORRECCIÓN 4: Leemos desde orden.producto */}
                      {orden.producto?.modelo || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {/* CORRECCIÓN 5: Leemos la razón desde GSPN y usamos colores dinámicos */}
                      <span className={`px-2.5 py-1 text-xs font-medium border rounded-full whitespace-nowrap ${getStatusColor(orden.reparacion?.status?.razon)}`}>
                        {orden.reparacion?.status?.razon || orden.estado || 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {/* CORRECCIÓN 6: Leemos el ingeniero desde la ruta correcta */}
                      {orden.reparacion?.tipoServicio?.ingeniero?.nombre || <span className="text-gray-400 italic">Sin asignar</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/ods/${orden.id}`}
                          className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-md transition-colors"
                          title="Ver / Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}