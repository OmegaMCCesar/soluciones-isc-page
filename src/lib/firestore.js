import  { db }  from './firebase';
import { 
  collection, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  doc, 
  getDocs, 
  getDoc,
  query, 
  orderBy, 
  where,
  Timestamp, 
  setDoc
} from 'firebase/firestore';

const ODS_COLLECTION = 'ods';

// Parsear el formato de GSPN (Versión robusta para bloques de texto)
export function parsearGSPN(textoGSPN) {
  // Inicializamos el objeto vacío con la estructura correcta
  const ods = {
    informacionGeneral: { id: '', numero: '', fecha: '' },
    cliente: { nombre: '', telefono: '', telefonoCasa: '', telefonoMovil: '' },
    producto: { modelo: '', descripcion: '', serie: '', sku: '' },
    reparacion: {
      tipoServicio: { tipo: '', ingeniero: { id: '', nombre: '' } },
      status: { razon: '' },
      ultimaCita: { fecha: '' },
      statusComment: '',
      comentarios: '',
      repairDetail: { tipoDefecto: '', bloqueDefecto: '', codigoSintoma: '', recomendar: '', codigoReparacion: '', codigoCondicion: '', serviceIndicator: '', distancia: '' }
    }
  };

  try {
    // 1. Extraer Información General
    const matchGeneral = textoGSPN.match(/Informacion General\s*\[(.*?)\]/i);
    if (matchGeneral) {
      const partes = matchGeneral[1].split('//').map(p => p.trim());
      ods.informacionGeneral.id = partes[0] || '';
      ods.informacionGeneral.numero = partes[2] || '';
      ods.informacionGeneral.fecha = partes[3] || '';
    }

    // 2. Extraer Información del Cliente
    const matchCliente = textoGSPN.match(/Informacion del Cliente\s*\[(.*?)\]/i);
    if (matchCliente) {
      const contenidoCliente = matchCliente[1];
      const partes = contenidoCliente.split('//').map(p => p.trim());
      
      // Limpiamos el prefijo "Cliente General," si existe
      if (partes[0]) {
        ods.cliente.nombre = partes[0].replace(/Cliente General,\s*/i, '');
      }
      
      ods.cliente.telefono = partes[1] || '';
      
      const homeMatch = contenidoCliente.match(/\[Home\]\s*([\d\s]+)/i);
      if (homeMatch) ods.cliente.telefonoCasa = homeMatch[1].trim();
      
      const movilMatch = contenidoCliente.match(/\[Mobile\]\s*([\d\s]+)/i);
      if (movilMatch) ods.cliente.telefonoMovil = movilMatch[1].trim();
    }

    // 3. Extraer Información del Producto
    const matchProducto = textoGSPN.match(/Informacion de producto\s*\[(.*?)\]/i);
    if (matchProducto) {
      const partes = matchProducto[1].split('//').map(p => p.trim());
      const modeloYDesc = partes[0] || '';
      
      // Separamos el modelo de la descripción (el modelo suele ser la primera palabra continua)
      const modMatch = modeloYDesc.match(/^(\S+)\s+(.*)/);
      if (modMatch) {
        ods.producto.modelo = modMatch[1].trim();
        ods.producto.descripcion = modMatch[2].trim();
      } else {
        ods.producto.modelo = modeloYDesc;
      }
      
      ods.producto.serie = partes[1] || '';
      ods.producto.sku = partes[3] || '';
    }

    // 4. Extraer Ingeniero asignado
    // Usamos ([\s\S]*?) para atrapar TODO, incluso si hay "Enters" invisibles
    const matchIngeniero = textoGSPN.match(/Ingeniero([\s\S]*?)Status\/\s*Reason/i);
    if (matchIngeniero) {
      // .trim() limpiará cualquier salto de línea o espacio en blanco al inicio y al final
      const ingenieroRaw = matchIngeniero[1].trim();
      
      const numMatch = ingenieroRaw.match(/^(\d+)\s+(.*)/);
      if (numMatch) {
        ods.reparacion.tipoServicio.ingeniero.id = numMatch[1].trim();
        ods.reparacion.tipoServicio.ingeniero.nombre = numMatch[2].trim();
      } else {
        ods.reparacion.tipoServicio.ingeniero.nombre = ingenieroRaw;
      }
    }

    // 5. Extraer Status / Razón
    // Captura lo que está justo después de "Status/ Reason"
    const matchStatus = textoGSPN.match(/Status\/\s*Reason\s*([^\n]+)/i);
    if (matchStatus) {
      ods.reparacion.status.razon = matchStatus[1].trim();
    }

  } catch (error) {
    console.error('Error parseando GSPN:', error);
    // Podrías devolver null aquí si prefieres que falle por completo en caso de error
  }

  return ods;
}

// Crear nueva ODS desde texto GSPN
export async function crearODSDesdeGSPN(textoGSPN, usuarioId = 'sistema') {
  try {
    const datosParseados = parsearGSPN(textoGSPN);
    
    // Verificamos que sí tengamos un ID válido de la orden
    const idDocumento = datosParseados?.informacionGeneral?.id;
    
    if (!idDocumento) {
      throw new Error('No se encontró el número de orden (ID) en el texto de GSPN.');
    }

    const odsData = {
      ...datosParseados,
      folio: idDocumento,
      fechaCreacion: Timestamp.now(),
      fechaActualizacion: Timestamp.now(),
      estado: determinarEstado(datosParseados.reparacion?.status?.razon || ''),
      creadoPor: usuarioId,
      fuente: 'GSPN'
    };

    // 1. Creamos la referencia al documento ESPECÍFICO usando el ID de GSPN
    // OJO: Es db, luego el nombre de la colección, y luego el ID
    const docRef = doc(db, ODS_COLLECTION, idDocumento); 
    
    // 2. Usamos setDoc para guardar los datos en esa referencia
    await setDoc(docRef, odsData);
    
    return { id: idDocumento, ...odsData };
  } catch (error) {
    console.error('Error al crear ODS desde GSPN:', error);
    throw error;
  }
}

// Determinar estado basado en el texto de GSPN
function determinarEstado(razon) {
  if (razon.includes('Pendiente')) return 'pendiente';
  if (razon.includes('progreso')) return 'en_proceso';
  if (razon.includes('Completada') || razon.includes('REPARADO')) return 'completada';
  if (razon.includes('Cancelada')) return 'cancelada';
  return 'pendiente';
}

// Crear ODS manual (para cuando no viene de GSPN)
export async function crearODS(odsData) {
  try {
    const dataConFechas = {
      ...odsData,
      fechaCreacion: Timestamp.now(),
      fechaActualizacion: Timestamp.now(),
      estado: odsData.estado || 'pendiente',
      fuente: 'manual',
      creadoPor: odsData.usuarioId || 'sistema'
    };
    
    const docRef = await addDoc(collection(db, ODS_COLLECTION), dataConFechas);
    return { id: docRef.id, ...dataConFechas };
  } catch (error) {
    console.error('Error al crear ODS:', error);
    throw error;
  }
}

// Obtener todas las órdenes
export async function obtenerODS() {
  try {
    const q = query(collection(db, ODS_COLLECTION), orderBy('fechaCreacion', 'desc'));
    const querySnapshot = await getDocs(q);
    const ods = [];
    querySnapshot.forEach((doc) => {
      ods.push({ id: doc.id, ...doc.data() });
    });
    return ods;
  } catch (error) {
    console.error('Error al obtener ODS:', error);
    throw error;
  }
}

// Obtener una orden específica
export async function obtenerODSPorId(id) {
  try {
    const docRef = doc(db, ODS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error al obtener ODS:', error);
    throw error;
  }
}

// Actualizar orden
export async function actualizarODS(id, datosActualizados) {
  try {
    const docRef = doc(db, ODS_COLLECTION, id);
    const dataActualizada = {
      ...datosActualizados,
      fechaActualizacion: Timestamp.now()
    };
    await updateDoc(docRef, dataActualizada);
    return { id, ...dataActualizada };
  } catch (error) {
    console.error('Error al actualizar ODS:', error);
    throw error;
  }
}

// Eliminar orden
export async function eliminarODS(id) {
  try {
    const docRef = doc(db, ODS_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error al eliminar ODS:', error);
    throw error;
  }
}

// Obtener órdenes por estado
export async function obtenerODSPorEstado(estado) {
  try {
    const q = query(
      collection(db, ODS_COLLECTION), 
      where('estado', '==', estado),
      orderBy('fechaCreacion', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const ods = [];
    querySnapshot.forEach((doc) => {
      ods.push({ id: doc.id, ...doc.data() });
    });
    return ods;
  } catch (error) {
    console.error('Error al obtener ODS por estado:', error);
    throw error;
  }
}

// Buscar órdenes por modelo, serie o cliente
export async function buscarODS(termino) {
  try {
    // Nota: Firestore no tiene búsqueda de texto completo nativa
    // Esta es una implementación simple, para búsquedas más complejas considera Algolia o similar
    const q = query(collection(db, ODS_COLLECTION), orderBy('fechaCreacion', 'desc'));
    const querySnapshot = await getDocs(q);
    const resultados = [];
    
    termino = termino.toLowerCase();
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Buscar en campos relevantes
      if (
        data.producto?.modelo?.toLowerCase().includes(termino) ||
        data.producto?.serie?.toLowerCase().includes(termino) ||
        data.cliente?.nombre?.toLowerCase().includes(termino) ||
        data.informacionGeneral?.id?.toLowerCase().includes(termino)
      ) {
        resultados.push({ id: doc.id, ...data });
      }
    });
    
    return resultados;
  } catch (error) {
    console.error('Error al buscar ODS:', error);
    throw error;
  }
}