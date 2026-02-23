import { NextResponse } from 'next/server'

export function proxy(request) {
  // 1. Buscamos la cookie que creamos en el login
  const session = request.cookies.get('admin_session')

  // 2. Proteger las rutas de /admin
  if (request.nextUrl.pathname.startsWith('/admin') && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. Prevenir que un admin logueado vea la pantalla de login
  if (request.nextUrl.pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/admin/ods', request.url))
  }

  // 4. Si todo está bien, dejamos continuar
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login'
  ]
}