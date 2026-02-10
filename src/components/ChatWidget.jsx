'use client'

import { useEffect, useState, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hola 👋 Soy el asistente de ISC, ¿te ayudo con tu servicio?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const sessionIdRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Session
  useEffect(() => {
    let sessionId = localStorage.getItem('isc-chat-session')
    if (!sessionId) {
      sessionId = uuidv4()
      localStorage.setItem('isc-chat-session', sessionId)
    }
    sessionIdRef.current = sessionId
  }, [])

  // Auto open (una sola vez)
  useEffect(() => {
    const dismissed = localStorage.getItem('isc-chat-dismissed')
    if (!dismissed) {
      setTimeout(() => setIsOpen(true), 2500)
    }
  }, [])

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userText = input
    setMessages(prev => [...prev, { from: 'user', text: userText }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          message: userText
        })
      })

      const data = await res.json()
      setMessages(prev => [...prev, { from: 'bot', text: data.reply }])
    } catch {
      setMessages(prev => [
        ...prev,
        { from: 'bot', text: 'Hubo un problema 😕 Escríbenos por WhatsApp y te atendemos de inmediato.' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem('isc-chat-dismissed', 'true')
  }

  /* BOTÓN FLOTANTE */
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full
        bg-linear-to from-green-500 to-emerald-600
        text-white shadow-xl flex items-center justify-center
        text-xl hover:scale-105 transition z-9999"
        aria-label="Abrir chat"
      >
        💬
      </button>
    )
  }

  /* CHAT */
  return (
    <div className="fixed bottom-24 right-6 w-80 h-120 bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden z-9999">
      
      {/* HEADER */}
      <div className="bg-linear-to-r from-green-600 to-emerald-600 text-white px-4 py-3 flex items-center justify-between">
        <div>
          <div className="font-semibold leading-tight">Asistente ISC</div>
          <div className="text-xs opacity-90">Soporte técnico</div>
        </div>
        <button onClick={handleClose} className="text-white text-lg">
          ✕
        </button>
      </div>

      {/* MENSAJES */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-3 flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                m.from === 'user'
                  ? 'bg-green-600 text-white rounded-br-md'
                  : 'bg-white text-gray-800 shadow rounded-bl-md'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-xs text-gray-400 mt-2 animate-pulse">
            Escribiendo…
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-3 border-t bg-white flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Escribe tu mensaje…"
          className="flex-1 border rounded-full px-4 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={sendMessage}
          className="bg-green-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-green-700 transition"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
