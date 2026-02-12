import admin from 'firebase-admin'

const privateKeyEnv = process.env.FIREBASE_ADMIN_PRIVATE_KEY
const clientEmailEnv = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
const projectIdEnv = process.env.FIREBASE_ADMIN_PROJECT_ID
console.log(clientEmailEnv, projectIdEnv);

if (!privateKeyEnv || !clientEmailEnv || !projectIdEnv) {
  throw new Error('Firebase Admin SDK no configurado correctamente.')
}

const privateKey = privateKeyEnv.replace(/\\n/g, '\n')

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: 'service_account',
      project_id: projectIdEnv,
      private_key: privateKey,
      client_email: clientEmailEnv,
    }),
  })

  if (process.env.NODE_ENV !== 'production') {
    console.log('Firebase Admin inicializado correctamente')
  }
}

const adminDb = admin.firestore()

export { adminDb, admin }
