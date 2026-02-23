import { NextResponse } from 'next/server'

export function middleware(request) {
  // 1. Buscamos la cookie que creamos en el login
  const session = request.cookies.get('admin_session')

  // 2. Proteger las rutas de /admin
  // Si la URL empieza con /admin y NO hay sesión -> Pa' fuera (al login)
  if (request.nextUrl.pathname.startsWith('/admin') && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. Prevenir que un admin logueado vea la pantalla de login
  // Si ya tiene sesión e intenta entrar a /login -> Pa' dentro (al admin)
  if (request.nextUrl.pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/admin/ods', request.url))
  }

  // Si todo está bien, dejamos que la petición continúe
  return NextResponse.next()
}

// 4. Le decimos a Next.js en qué rutas exactas debe ejecutar este middleware
export const config = {
  matcher: [
    '/admin/:path*', // Aplica a /admin y todo lo que esté dentro (/admin/ods, etc.)
    '/login'         // Aplica a la ruta de login
  ]
}