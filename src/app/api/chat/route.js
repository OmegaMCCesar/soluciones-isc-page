import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

// Helper para normalizar texto (quitar acentos y minúsculas para comparaciones)
const normalize = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export async function POST(req) {
  try {
    const { message, sessionId } = await req.json()

    if (!message || !sessionId) {
      return NextResponse.json({ reply: 'Faltan datos.' }, { status: 400 })
    }

    const sessionRef = adminDb.collection('chatSessions').doc(sessionId)
    let sessionSnap = await sessionRef.get()
    
    // Texto original y normalizado
    const textRaw = message;
    const text = normalize(message);

    // ==========================================
    // 1. LÓGICA DE REINICIO GLOBAL
    // ==========================================
    if (text === 'iniciar' || text === 'reiniciar' || (!sessionSnap.exists && message === 'INIT_CHAT')) {
      const newSession = {
        step: 'WAIT_HAS_ODS',
        data: {},
        updatedAt: new Date()
      }
      await sessionRef.set(newSession)
      return NextResponse.json({
        reply: 'Hola 👋 Soy el asistente de ISC.\n¿Ya cuentas con número de orden (ODS)?',
        options: ['Sí', 'No']
      })
    }

    if (!sessionSnap.exists) {
        await sessionRef.set({ step: 'WAIT_HAS_ODS', data: {}, updatedAt: new Date() })
        return NextResponse.json({
            reply: 'Hola 👋, parece que tu sesión expiró.\n¿Ya cuentas con número de orden (ODS)?',
            options: ['Sí', 'No']
        })
    }

    let session = sessionSnap.data()
    let reply = ''
    let options = [] 

    if (message === 'INIT_CHAT') {
        return NextResponse.json({
            reply: 'Hola de nuevo 👋. ¿En qué puedo ayudarte hoy?',
            options: ['Iniciar']
        })
    }

    // ==========================================
    // 2. MÁQUINA DE ESTADOS
    // ==========================================
    switch (session.step) {

      case 'WAIT_HAS_ODS':
        if (text === 'si') {
          session.step = 'WAIT_ODS_NUMBER'
          reply = 'Perfecto 👍\nEscribe el número de tu ODS.'
        } 
        else if (text === 'no') {
          session.step = 'WAIT_NAME'
          reply = 'Con gusto te ayudamos 👍\n¿Cuál es tu nombre completo?'
        } 
        else {
          reply = 'Por favor selecciona una opción o responde únicamente: sí o no'
          options = ['Sí', 'No']
        }
        break

case 'WAIT_ODS_NUMBER':
        const odsNumber = textRaw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        
        if (odsNumber.length < 4) {
            reply = 'El número de ODS parece muy corto. Por favor verifícalo.';
            break; 
        }

        // 1. Apuntamos a la nueva colección 'ods'
        const odsRef = adminDb.collection('ods').doc(odsNumber)
        const odsSnap = await odsRef.get()

        if (odsSnap.exists) {
          const odsData = odsSnap.data()
          
          // 2. Extraemos los datos usando la NUEVA estructura unificada
          const estadoActual = odsData.reparacion?.status?.razon || odsData.estado || 'En proceso';
          const nombreCliente = odsData.cliente?.nombre || 'No disponible';
          // Tomamos solo el primer nombre para hacerlo más amigable
          const primerNombre = nombreCliente.split(' ')[0]; 
          
          const modelo = odsData.producto?.modelo || 'Tu equipo';
          const marca = odsData.producto?.descripcion?.split(' ')[0] || '';
          const fechaLlegadaRefaccion = odsData.reparacion?.fecha_refaccion;
          
          let fechaTexto = 'Pendiente';
          if (odsData.fechaCreacion && odsData.fechaCreacion.toDate) {
              fechaTexto = odsData.fechaCreacion.toDate().toLocaleDateString();
          }

          let mensajeExtra = '';
          if (estadoActual.toLowerCase().includes('espera de refacción') && fechaLlegadaRefaccion) {
            mensajeExtra = `\n📦 *Llegada de pieza:* ${fechaLlegadaRefaccion}`;
          }

          // 3. Formateamos el mensaje para el cliente
          reply = 
`Hola ${primerNombre}, aquí tienes la información de tu ODS:

🔢 **Folio:** ${odsData.folio || odsNumber}
📺 **Equipo:** ${marca} ${modelo}
🛠 **Estado Actual:** ${estadoActual}
📅 **Fecha de Ingreso:** ${fechaTexto}${mensajeExtra}

Si deseas realizar otra consulta, presiona el botón de abajo.`
        } else {
          // Si no existe, lo mandamos a pendientes de carga como ya lo tenías
          await adminDb.collection('odsPendientesCarga').add({
            odsNumber,
            createdAt: new Date(),
            status: 'Pendiente de validación ASC'
          })

          reply = 
`🟡 No logré encontrar la orden ${odsNumber} en el sistema. Es posible que apenas esté en proceso de carga.

Te recomendamos verificar el número o consultar nuevamente más tarde.

¿Deseas hacer otra cosa?`
        }

        session.step = 'DONE'
        options = ['Iniciar', 'Salir']
        break


      case 'WAIT_NAME':
        if (text.length < 3) {
            reply = 'Por favor escribe un nombre válido (mínimo 3 letras).';
            break;
        }
        session.data.nombre = textRaw
        session.step = 'WAIT_PHONE'
        reply = 'Gracias 👍\n¿Cuál es tu número de teléfono? (10 dígitos)'
        break


      case 'WAIT_PHONE':
        // 1. Limpiamos: Dejamos solo números
        const phoneClean = textRaw.replace(/\D/g, '');

        // 2. Validamos longitud exacta de 10
        if (phoneClean.length !== 10) {
            reply = `⚠️ El número debe tener 10 dígitos.\nEscribiste ${phoneClean.length}. Por favor verifícalo e intenta de nuevo.`;
            // NO avanzamos de paso (session.step no cambia)
            break;
        }

        session.data.telefono = phoneClean
        session.step = 'WAIT_PRODUCT'
        
        // 3. Instrucción clara de opciones vs escritura
        reply = '¿Qué producto necesitas revisar?\n(Selecciona una opción o escribe la tuya si no aparece)'
        options = ['Refrigerador', 'Lavadora', 'Horno', 'Secadora']
        break


      case 'WAIT_PRODUCT':
        session.data.producto = textRaw
        session.step = 'WAIT_BRAND'
        
        reply = '¿Cuál es la marca del producto?\n(Selecciona o escribe la marca)'
        options = ['Samsung', 'LG', 'Mabe', 'Whirlpool', 'Hisense']
        break


      case 'WAIT_BRAND':
        session.data.marca = textRaw
        session.step = 'WAIT_MODEL'
        reply = '¿Cuál es el modelo del equipo? (Lo encuentras en la etiqueta lateral o trasera)'
        break


      case 'WAIT_MODEL':
        session.data.modelo = textRaw
        session.step = 'WAIT_SERIAL'
        reply = 'Por último, escribe el número de serie.'
        break


      case 'WAIT_SERIAL':
        session.data.numeroSerie = textRaw

        await adminDb.collection('solicitudesSinODS').add({
          ...session.data,
          createdAt: new Date(),
          status: 'Pendiente de contacto ASC'
        })

        reply = 
`✅ Hemos recibido tu información correctamente.

Un asesor del Centro de Servicio se pondrá en contacto contigo pronto al número: ${session.data.telefono}.

¿Necesitas algo más?`
        
        session.step = 'DONE'
        options = ['Iniciar nueva consulta']
        break


      case 'DONE':
        reply = 'La sesión ha finalizado. Escribe "iniciar" para comenzar de nuevo.'
        options = ['Iniciar']
        break

      default:
        session.step = 'WAIT_HAS_ODS'
        reply = 'Tuve una pequeña confusión. Empecemos de nuevo.\n¿Ya cuentas con número de ODS?'
        options = ['Sí', 'No']
        break
    }

    await sessionRef.set(session, { merge: true })

    return NextResponse.json({ reply, options })

  } catch (error) {
    console.error('ERROR EN API CHAT:', error)
    return NextResponse.json(
      { reply: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}