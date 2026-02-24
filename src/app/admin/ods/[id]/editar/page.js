'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ArrowLeft, Save, AlertCircle } from 'lucide-react'

// Los mismos estados que manejas en tu creación manual
const ODS_STATES = [
  'Recibido en ASC',
  'En diagnóstico',
  'En espera de aprobación',
  'En espera de refacción',
  'En reparación',
  'Listo para entrega',
  'Entregado',
  'Cancelada'
]

export default function EditarODS() {
  const params = useParams()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Estado plano para facilitar el manejo del formulario
  const [formData, setFormData] = useState({
    estado: '',
    tecnico: '',
    telefono: '',
    fecha_refaccion: ''
  })

  // 1. Cargar los datos actuales al abrir la página
  useEffect(() => {
    const cargarOrden = async () => {
      if (!params?.id) return
      
      try {
        const docRef = doc(db, 'ods', params.id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          // Extraemos los datos anidados a nuestro estado plano
          setFormData({
            estado: data.estado || data.reparacion?.status?.razon || 'Recibido en ASC',
            tecnico: data.reparacion?.tipoServicio?.ingeniero?.nombre || '',
            telefono: data.cliente?.telefono || '',
            fecha_refaccion: data.reparacion?.fecha_refaccion || ''
          })
        } else {
          setError('No se encontró la orden especificada.')
        }
      } catch (err) {
        console.error('Error al cargar ODS para editar:', err)
        setError('Error al cargar los datos.')
      } finally {
        setLoading(false)
      }
    }

    cargarOrden()
  }, [params?.id])

  // 2. Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // 3. Guardar los cambios en Firebase
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      if (formData.estado === 'En espera de refacción' && !formData.fecha_refaccion) {
        throw new Error('Debes ingresar la fecha estimada de llegada de la refacción.')
      }

      const docRef = doc(db, 'ods', params.id)

      // TRUCO DE FIREBASE: Usamos comillas y puntos ('reparacion.status.razon') 
      // para actualizar solo ese dato anidado sin borrar el resto del objeto 'reparacion'.
      const datosActualizados = {
        estado: formData.estado,
        'reparacion.status.razon': formData.estado,
        'reparacion.tipoServicio.ingeniero.nombre': formData.tecnico.trim(),
        'cliente.telefono': formData.telefono.trim(),
        'reparacion.fecha_refaccion': formData.estado === 'En espera de refacción' ? formData.fecha_refaccion : null,
        fechaActualizacion: serverTimestamp()
      }

      await updateDoc(docRef, datosActualizados)

      // Regresamos a la vista de detalles al terminar
      router.push(`/admin/ods/${params.id}`)

    } catch (err) {
      console.error('Error al actualizar:', err)
      setError(err.message || 'Hubo un error al guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-4 border-black border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up mt-8">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 border-b pb-4">
        <Link 
          href={`/admin/ods/${params.id}`}
          className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar ODS: {params.id}</h1>
          <p className="text-sm text-gray-500">Actualiza el estado y seguimiento del equipo.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        
        {/* Estado */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Estado de Reparación
          </label>
          <select 
            name="estado" 
            value={formData.estado} 
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none text-sm transition-all"
          >
            {/* Si el estado actual (ej. de GSPN) no está en nuestra lista limpia, lo mostramos como una opción extra para no perderlo */}
            {!ODS_STATES.includes(formData.estado) && formData.estado !== '' && (
              <option value={formData.estado}>{formData.estado}</option>
            )}
            {ODS_STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        {/* Fecha de Refacción Condicional */}
        {formData.estado === 'En espera de refacción' && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg animate-fade-in-up">
            <label className="block text-sm font-semibold text-orange-900 mb-1">
              Fecha estimada de refacción <span className="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              name="fecha_refaccion" 
              value={formData.fecha_refaccion} 
              onChange={handleChange}
              className="w-full px-4 py-2 border border-orange-300 rounded-md focus:ring-2 focus:ring-orange-500 outline-none text-sm" 
            />
          </div>
        )}

        {/* Técnico Asignado */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Técnico Asignado
          </label>
          <input 
            type="text" 
            name="tecnico" 
            value={formData.tecnico} 
            onChange={handleChange} 
            placeholder="Ej. Christian Bautista"
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none text-sm transition-all" 
          />
        </div>

        {/* Teléfono del Cliente */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Teléfono de Contacto (Cliente)
          </label>
          <input 
            type="text" 
            name="telefono" 
            value={formData.telefono} 
            onChange={handleChange} 
            placeholder="Ej. 5512345678"
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none text-sm transition-all" 
          />
          <p className="text-xs text-gray-500 mt-1">Útil si el cliente cambió de número o hay un error en GSPN.</p>
        </div>

        {/* BOTONES */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t">
          <Link 
            href={`/admin/ods/${params.id}`}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className={`flex items-center px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-all ${
              saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800 shadow-md'
            }`}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

      </form>
    </div>
  )
}