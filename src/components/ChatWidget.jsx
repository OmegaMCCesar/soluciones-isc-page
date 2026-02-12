'use client'

import { useEffect, useState, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [quickOptions, setQuickOptions] = useState(null) 

  const sessionIdRef = useRef(null)
  const messagesEndRef = useRef(null)
  const hasStartedRef = useRef(false)

  // ==========================
  // CREAR / RECUPERAR SESSION
  // ==========================
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let sessionId = localStorage.getItem('isc-chat-session')
      if (!sessionId) {
        sessionId = uuidv4()
        localStorage.setItem('isc-chat-session', sessionId)
      }
      sessionIdRef.current = sessionId
    }
  }, [])

  // ==========================
  // INICIAR CONVERSACIÓN
  // ==========================
  useEffect(() => {
    if (!sessionIdRef.current || hasStartedRef.current) return

    const startChat = async () => {
      try {
        hasStartedRef.current = true
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            message: 'INIT_CHAT' 
          })
        })
        const data = await res.json()
        setMessages([{ from: 'bot', text: data.reply }])
        if (data.options) setQuickOptions(data.options)
      } catch (error) {
        console.error(error)
      }
    }
    startChat()
  }, [])

  // ==========================
  // AUTO OPEN (DELAY)
  // ==========================
  useEffect(() => {
    const dismissed = localStorage.getItem('isc-chat-dismissed')
    if (!dismissed) {
      setTimeout(() => setIsOpen(true), 2500)
    }
  }, [])

  // ==========================
  // AUTO SCROLL
  // ==========================
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages, loading, quickOptions, isOpen])

  // ==========================
  // ENVIAR MENSAJE
  // ==========================
  const sendMessage = async (textOverride = null) => {
    const textToSend = textOverride || input
    if (!textToSend.trim() || loading) return

    setMessages(prev => [...prev, { from: 'user', text: textToSend }])
    setInput('')
    setQuickOptions(null)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          message: textToSend
        })
      })

      const data = await res.json()

      setMessages(prev => [...prev, { from: 'bot', text: data.reply }])
      
      if (data.options && data.options.length > 0) {
        setQuickOptions(data.options)
      }

    } catch (error) {
      setMessages(prev => [
        ...prev,
        { from: 'bot', text: 'Hubo un problema de conexión 😕 Intenta de nuevo.' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem('isc-chat-dismissed', 'true')
  }

  // ==========================
  // BOTÓN FLOTANTE (CERRADO)
  // ==========================
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        // CAMBIO AQUÍ: bottom-24 para subirlo y evitar el botón de WhatsApp
        className="fixed bottom-24 right-6 w-16 h-16 rounded-full
        bg-linear-to-r from-emerald-500 to-green-600
        text-white shadow-2xl flex items-center justify-center
        text-3xl hover:scale-110 transition-transform duration-300 z-9999 animate-bounce-slow"
        aria-label="Abrir chat de soporte"
      >
        💬
      </button>
    )
  }

  // ==========================
  // VENTANA DEL CHAT (ABIERTA)
  // ==========================
  return (
    <div 
      // CAMBIOS AQUÍ: 
      // 1. bottom-24: Para alinearse con donde estaba el botón y no tapar WhatsApp si está minimizado.
      // 2. max-h-[80vh]: Esto evita que se corte la parte superior en pantallas pequeñas (laptops).
      className="fixed bottom-24 right-6 w-[90vw] md:w-96 h-150 max-h-[80vh] 
      bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden z-9999 
      border border-gray-100 font-sans"
    >
      
      {/* HEADER */}
      <div className="bg-linear-to-r from-emerald-600 to-green-700 text-white p-4 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
            🤖
          </div>
          <div>
            <h3 className="font-bold text-lg leading-none">Asistente ISC</h3>
            <span className="text-xs text-green-100 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
              En línea
            </span>
          </div>
        </div>
        <button onClick={handleClose} className="text-white/80 hover:text-white transition p-1 hover:bg-white/10 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* MENSAJES AREA */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50 scrollbar-thin scrollbar-thumb-gray-300">
        <div className="text-center text-xs text-gray-400 my-4">
          Hoy
        </div>
        
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-4 flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.from === 'bot' && (
               <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold mr-2 mt-1 shrink-0">
                 ISC
               </div>
            )}
            
            <div
              className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm shadow-sm whitespace-pre-wrap ${
                m.from === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none'
                  : 'bg-white text-gray-700 rounded-bl-none border border-gray-100'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start mb-4 animate-pulse">
             <div className="w-8 h-8 rounded-full bg-emerald-100 mr-2 shrink-0"></div>
             <div className="bg-gray-200 h-8 w-16 rounded-full flex items-center justify-center gap-1 px-3">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
             </div>
          </div>
        )}

        {/* QUICK OPTIONS (BOTONES) */}
        {!loading && quickOptions && (
          <div className="flex flex-wrap gap-2 justify-start ml-10 mb-4 animate-fade-in-up">
            {quickOptions.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(opt)}
                className="bg-white border border-emerald-500 text-emerald-600 px-4 py-2 rounded-full text-xs font-semibold hover:bg-emerald-50 transition shadow-sm active:scale-95 hover:shadow-md"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-3 bg-white border-t border-gray-100 shrink-0">
        <div className="flex gap-2 items-center bg-gray-100 px-4 py-2 rounded-full border border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder={loading ? "Esperando respuesta..." : "Escribe aquí..."}
            disabled={loading}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-700 outline-none placeholder-gray-400"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className={`p-2 rounded-full transition-all ${
              !input.trim() || loading 
                ? 'text-gray-400 bg-transparent' 
                : 'text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transform hover:scale-105'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
        <div className="text-center mt-2">
            <span className="text-[10px] text-gray-400">Powered by LCMC</span>
        </div>
      </div>
    </div>
  )
}