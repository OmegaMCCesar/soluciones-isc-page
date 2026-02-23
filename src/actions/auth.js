'use server'

import { cookies } from 'next/headers'

export async function createSession(uid) {
  // En Next.js 15/16, cookies() debe llevar 'await'
  const cookieStore = await cookies() 
  
  cookieStore.set('admin_session', uid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 semana
    path: '/',
  })
}

export async function removeSession() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
}