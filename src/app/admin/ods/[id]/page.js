'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ArrowLeft, User, MonitorSmartphone, PenTool, Calendar, Edit2 } from 'lucide-react'

export default function ODSDetalle() {
  const params = useParams()
  const router = useRouter()
  const [orden, setOrden] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarOrden = async () => {
      if (!params?.id) return
      
      try {
        const docRef = doc(db, 'ods', params.id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setOrden({ id: docSnap.id, ...docSnap.data() })
        } else {
          setError('No se encontró la orden especificada.')
        }
      } catch (err) {
        console.error('Error al cargar detalle:', err)
        setError('Hubo un problema al cargar los datos de la orden.')
      } finally {
        setLoading(false)
      }
    }

    cargarOrden()
  }, [params?.id])

  const getStatusColor = (status) => {
    const estadoActual = status?.toLowerCase() || 'pendiente'
    if (estadoActual.includes('pendiente')) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (estadoActual.includes('progreso') || estadoActual.includes('revisión')) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (estadoActual.includes('completada')) return 'bg-green-100 text-green-800 border-green-200'
    if (estadoActual.includes('espera')) return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-black border-t-transparent animate-spin" />
          <p className="text-gray-500 font-medium">Cargando detalles...</p>
        </div>
      </div>
    )
  }

  if (error || !orden) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-red-50 text-red-600 rounded-lg border border-red-100 text-center">
        <p className="font-medium">{error}</p>
        <button onClick={() => router.push('/admin/ods')} className="mt-4 px-4 py-2 bg-white text-red-600 rounded shadow-sm border border-red-200 hover:bg-red-50">
          Volver a la lista
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/ods" className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              ODS: {orden.id}
              <span className={`px-3 py-1 text-xs font-semibold border rounded-full ml-2 ${getStatusColor(orden.reparacion?.status?.razon || orden.estado)}`}>
                {orden.reparacion?.status?.razon || orden.estado || 'Pendiente'}
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Fuente: <span className="font-medium uppercase">{orden.fuente || 'Manual'}</span>
            </p>
          </div>
        </div>

        <Link 
          href={`/admin/ods/${orden.id}/editar`}
          className="flex items-center px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Editar Orden
        </Link>
      </div>

      {/* GRID DE TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* TARJETA: CLIENTE */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-emerald-600">
            <User className="w-5 h-5" />
            <h2 className="text-lg font-bold text-gray-900">Datos del Cliente</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Nombre Completo</p>
              <p className="text-gray-900 font-medium">{orden.cliente?.nombre || 'No registrado'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Teléfono Principal</p>
                <p className="text-gray-900">{orden.cliente?.telefono || 'No registrado'}</p>
              </div>
              {(orden.cliente?.telefonoCasa || orden.cliente?.telefonoMovil) && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Teléfono Alt.</p>
                  <p className="text-gray-900">{orden.cliente?.telefonoCasa || orden.cliente?.telefonoMovil}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TARJETA: EQUIPO */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-blue-600">
            <MonitorSmartphone className="w-5 h-5" />
            <h2 className="text-lg font-bold text-gray-900">Información del Equipo</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Descripción / Marca</p>
              <p className="text-gray-900 font-medium">{orden.producto?.descripcion || 'No registrada'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Modelo</p>
                <p className="text-gray-900 font-mono text-sm">{orden.producto?.modelo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Número de Serie</p>
                <p className="text-gray-900 font-mono text-sm">{orden.producto?.serie || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* TARJETA: REPARACIÓN */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-purple-600">
            <PenTool className="w-5 h-5" />
            <h2 className="text-lg font-bold text-gray-900">Detalles de Reparación</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Técnico Asignado</p>
              <p className="text-gray-900 font-medium">
                {orden.reparacion?.tipoServicio?.ingeniero?.nombre || 'Sin asignar'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Tipo de Servicio</p>
              <p className="text-gray-900">{orden.reparacion?.tipoServicio?.tipo || 'No especificado'}</p>
            </div>
            {orden.reparacion?.fecha_refaccion && (
              <div className="bg-orange-50 border border-orange-100 p-3 rounded-md mt-2">
                <p className="text-xs text-orange-800 uppercase font-bold">Llegada estimada de refacción</p>
                <p className="text-orange-900 font-medium">{orden.reparacion.fecha_refaccion}</p>
              </div>
            )}
          </div>
        </div>

        {/* TARJETA: FECHAS Y LOGS */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-gray-600">
            <Calendar className="w-5 h-5" />
            <h2 className="text-lg font-bold text-gray-900">Fechas y Registro</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Fecha de Ingreso (Sistema)</p>
              <p className="text-gray-900">
                {orden.fechaCreacion?.toDate 
                  ? orden.fechaCreacion.toDate().toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })
                  : 'No disponible'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Fecha Reportada GSPN</p>
              <p className="text-gray-900">{orden.informacionGeneral?.fecha || 'N/A'}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}