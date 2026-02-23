'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ArrowLeft, Save } from 'lucide-react'

// Lista cerrada de estados según tu plan
const ODS_STATES = [
  'Recibido en ASC',
  'En diagnóstico',
  'En espera de aprobación',
  'En espera de refacción',
  'En reparación',
  'Listo para entrega',
  'Entregado'
]

export default function NewODS() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Estado del formulario
  const [formData, setFormData] = useState({
    odsId: '',
    nombre: '',
    telefono: '',
    producto: '',
    marca: '',
    modelo: '',
    numeroSerie: '',
    estado: 'Recibido en ASC',
    tecnico_asignado: '',
    fecha_refaccion: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Validar que si está en espera de refacción, tenga fecha
      if (formData.estado === 'En espera de refacción' && !formData.fecha_refaccion) {
        throw new Error('Debes ingresar una fecha tentativa de refacción.')
      }

      // 2. Limpiar el ID de la ODS (quitar espacios)
      const cleanOdsId = formData.odsId.trim().toUpperCase()

      // 3. Verificar si esa ODS ya existe para no sobrescribirla por accidente
      const docRef = doc(db, 'ods', cleanOdsId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        throw new Error(`La ODS ${cleanOdsId} ya está registrada en el sistema.`)
      }

      // 4. Guardar en Firestore usando la MISMA estructura que GSPN
      const dataToSave = {
        folio: cleanOdsId,
        fuente: 'manual',
        estado: formData.estado,
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
        
        // Empaquetamos en las mismas "cajas" que espera la tabla
        informacionGeneral: {
          id: cleanOdsId,
          numero: 'Registro Manual',
          fecha: new Date().toLocaleDateString()
        },
        cliente: {
          nombre: formData.nombre.trim(),
          telefono: formData.telefono.trim(),
          telefonoCasa: '',
          telefonoMovil: ''
        },
        producto: {
          modelo: formData.modelo.trim(),
          // Unimos marca y producto en la descripción para no perder el dato
          descripcion: `${formData.marca.trim()} ${formData.producto.trim()}`,
          serie: formData.numeroSerie.trim(),
          sku: ''
        },
        reparacion: {
          tipoServicio: {
            tipo: 'Ingreso Manual',
            ingeniero: {
              id: '',
              nombre: formData.tecnico_asignado.trim()
            }
          },
          status: {
            razon: formData.estado
          },
          // Guardamos la fecha de refacción aquí por si se necesita
          fecha_refaccion: formData.estado === 'En espera de refacción' ? formData.fecha_refaccion : null
        }
      }

      await setDoc(docRef, dataToSave)

      // 5. Redirigir a la tabla
      router.push('/admin/ods')

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/ods"
          className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registrar Nueva ODS</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ingresa los datos del equipo recibido en el centro de servicio.
          </p>
        </div>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 md:p-8 space-y-6">
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm border border-red-100">
            ⚠️ {error}
          </div>
        )}

        {/* Sección: Datos de la Orden */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">
            Identificador
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de ODS (GSPN / Real) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="odsId"
              required
              value={formData.odsId}
              onChange={handleChange}
              placeholder="Ej. 4174562263"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none text-sm uppercase"
            />
          </div>
        </div>

        {/* Sección: Datos del Cliente e Ingreso */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">
            Información del Cliente y Equipo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
              <input type="text" name="producto" placeholder="Ej. Refrigerador" value={formData.producto} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
              <input type="text" name="marca" placeholder="Ej. Samsung" value={formData.marca} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
              <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Serie</label>
              <input type="text" name="numeroSerie" value={formData.numeroSerie} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none text-sm" />
            </div>
          </div>
        </div>

        {/* Sección: Estado Operativo */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">
            Estado Operativo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Técnico Asignado</label>
              <input 
                type="text" 
                name="tecnico_asignado" 
                placeholder="Nombre del técnico"
                value={formData.tecnico_asignado} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none text-sm" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado Actual</label>
              <select 
                name="estado" 
                value={formData.estado} 
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none text-sm bg-white"
              >
                {ODS_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* Este campo SOLO aparece si el estado es "En espera de refacción" */}
            {formData.estado === 'En espera de refacción' && (
              <div className="md:col-span-2 p-4 bg-orange-50 border border-orange-200 rounded-md animate-fade-in-up">
                <label className="block text-sm font-medium text-orange-800 mb-1">
                  Fecha tentativa de llegada de refacción <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  name="fecha_refaccion" 
                  value={formData.fecha_refaccion} 
                  onChange={handleChange}
                  className="w-full md:w-1/2 px-4 py-2 border border-orange-300 rounded-md focus:ring-1 focus:ring-orange-500 outline-none text-sm" 
                />
              </div>
            )}
          </div>
        </div>

        {/* BOTÓN SUBMIT */}
        <div className="pt-6 border-t flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center px-6 py-2.5 rounded-md text-white font-medium transition-all ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-black hover:bg-gray-800 shadow-sm'
            }`}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Guardando...' : 'Guardar ODS'}
          </button>
        </div>

      </form>
    </div>
  )
}