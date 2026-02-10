import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

export async function POST(req) {
  const { sessionId, message } = await req.json()

  const sessionRef = doc(db, 'chatSessions', sessionId)
  const sessionSnap = await getDoc(sessionRef)

  let session = sessionSnap.exists()
    ? sessionSnap.data()
    : { step: 'ASK_BRAND', data: {} }

  let reply = ''

  switch (session.step) {
    case 'ASK_BRAND':
      reply = '¿De qué marca es tu producto?'
      session.step = 'WAIT_BRAND'
      break

    case 'WAIT_BRAND':
      session.data.marca = message
      reply = '¿Qué producto es? (ej. refrigerador, lavadora)'
      session.step = 'WAIT_PRODUCT'
      break

    case 'WAIT_PRODUCT':
      session.data.producto = message
      reply = 'Cuéntanos brevemente la falla'
      session.step = 'WAIT_ISSUE'
      break

    case 'WAIT_ISSUE':
      session.data.falla = message
      reply = 'Por favor indícanos tu nombre y teléfono'
      session.step = 'WAIT_CONTACT'
      break

    case 'WAIT_CONTACT':
      session.data.contacto = message

      // guardar lead
      await setDoc(doc(db, 'leads', sessionId), {
        ...session.data,
        estatus: 'nuevo',
        origen: 'chat_web',
        createdAt: new Date()
      })

      reply =
        session.data.marca.toLowerCase() === 'samsung'
          ? 'Gracias. En breve un asesor validará tu servicio.'
          : 'Gracias. Hemos registrado tu información y un asesor te contactará.'

      session.step = 'DONE'
      break

    default:
      reply = '¿En qué más puedo ayudarte?'
  }

  await setDoc(sessionRef, session)

  return NextResponse.json({ reply })
}
