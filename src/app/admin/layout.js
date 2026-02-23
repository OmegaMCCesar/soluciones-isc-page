'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { removeSession } from '@/actions/auth'
import { 
  ClipboardList, 
  LogOut, 
  Menu, 
  X, 
  Wrench,
  LayoutDashboard
} from 'lucide-react'

export default function AdminLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut(auth)
      await removeSession()
      router.push('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      setIsLoggingOut(false)
    }
  }

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Órdenes (ODS)', href: '/admin/ods', icon: ClipboardList, exact: false },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      
      {/* MENÚ MÓVIL (Overlay) */}
      <div className={`md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)} />

      {/* SIDEBAR (Barra Lateral) */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Cabecera del Sidebar */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 bg-black text-white shrink-0">
          <Wrench className="w-5 h-5 mr-3" />
          <span className="font-bold text-lg tracking-wide">Admin ISC</span>
          <button className="ml-auto md:hidden text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links de Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
            Gestión
          </div>
          
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-md transition-colors group ${
                  isActive 
                    ? 'bg-gray-100 text-black font-semibold' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-black' : 'text-gray-400 group-hover:text-gray-600'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Botón de Cerrar Sesión (Abajo) */}
        <div className="p-4 border-t border-gray-200 shrink-0">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <LogOut className="w-5 h-5 mr-3 opacity-80" />
            {isLoggingOut ? 'Saliendo...' : 'Cerrar Sesión'}
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Topbar (Solo visible en móviles) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 md:hidden shrink-0 shadow-sm z-30">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 mr-2 text-black hover:bg-gray-100 rounded-md transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-black text-lg">Soluciones ISC</span>
        </header>

        {/* Contenido dinámico */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
        
      </main>
    </div>
  )
}