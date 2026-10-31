import React, { useEffect, useRef, useState } from 'react'
import { Activity, ChevronDown, ChevronUp } from 'lucide-react'

export default function FrictionlessChat({ ws, isFolded, onToggleFold, username, onSetUsername }){
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  // New state to track cooldown status
  const [isCoolingDown, setIsCoolingDown] = useState(false)
  
  const chatEndRef = useRef(null)
  const messagesRef = useRef(null)

  useEffect(()=>{
    let handler
    let openHandler
    if(ws){
      handler = (e)=>{
        try{
          const data = JSON.parse(e.data)
          if(data.type === 'history'){
            const list = (data.messages || []).map(m => ({ id: m.id, user: m.author || 'anon', text: m.text }))
            setMessages(list)
          } else if (data.type === 'message'){
            setMessages(prev => [...prev, { id: data.id, user: data.author, text: data.text }])
          }
        }catch{}
      }
      ws.addEventListener('message', handler)
      
      openHandler = () => {
        ws.send(JSON.stringify({ type: 'get_messages' }))
      }
      
      if (ws.readyState === WebSocket.OPEN) {
        openHandler()
      } else {
        ws.addEventListener('open', openHandler)
      }
    }
    return ()=>{
      if(ws && handler) ws.removeEventListener('message', handler)
      if(ws && openHandler) ws.removeEventListener('open', openHandler)
    }
  },[ws])

  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:'smooth'}) },[messages])

  useEffect(()=>{
    if(messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight
  },[messages])

  const send = (e)=>{
    e?.preventDefault()
    // Prevent sending if input is empty OR if cooling down
    if(!input.trim() || isCoolingDown) return
    
    let author = username
    if (!author) {
      const result = window.prompt("IDENTIFIEZ-VOUS (pour le protocole) :")
      if (result && result.trim()) {
        author = result.trim()
        if(onSetUsername) onSetUsername(author)
      } else {
        author = 'anon'
      }
    }

    const payload = { type: 'message', author, text: input }
    
    if(ws && ws.readyState === WebSocket.OPEN){
      ws.send(JSON.stringify(payload))
    } else {
      setMessages(prev => [...prev, { id: Date.now(), user: author, text: input + ' (NON ENVOYÉ: déconnecté)' }])
    }

    // --- COOLDOWN LOGIC ---
    setInput('')
    setIsCoolingDown(true)
    setTimeout(() => {
      setIsCoolingDown(false)
    }, 2000) 
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 border-2 border-banan-primary bg-black/80">
      <div 
        className="p-2 bg-banan-primary text-banan-background font-bold uppercase text-xs flex items-center justify-between cursor-pointer lg:cursor-default" 
        onClick={() => {
          if (window.innerWidth < 1024) onToggleFold();
        }}
      >
        <div className="flex items-center gap-2">
          <Activity size={14} className={isCoolingDown ? "opacity-20" : "animate-pulse"}/>
          Télépathie Bananique {isCoolingDown && "(COOLDOWN)"}
        </div>
        
        {/* Keyboard users reach the fold toggle here; its click bubbles to the bar. */}
        <button
          type="button"
          className="lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-banan-background"
          aria-label={isFolded ? 'Déplier la télépathie' : 'Replier la télépathie'}
          aria-expanded={!isFolded}
        >
          {isFolded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
        </button>
      </div>

      {!isFolded && (
        <>
          <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 pb-0 space-y-3 font-mono text-sm scrollbar-hide">
            {messages.map(m => (
              <div key={m.id} className="border-l-2 border-gray-700 pl-2 hover:border-banan-primary transition-colors">
                <span className="text-gray-400 text-xs block">{m.user}</span>
                <span className="text-banan-primary">{m.text}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={send} className="p-2 border-t border-gray-800">
            <input 
              value={input} 
              onChange={e=>setInput(e.target.value)} 
              // Disable the input field when cooling down
              disabled={isCoolingDown}
              placeholder={isCoolingDown ? "Attente protocolaires..." : "Injecter une pensée..."} 
              className={`w-full bg-gray-900 border p-2 font-mono text-sm transition-opacity ${
                isCoolingDown 
                  ? "border-gray-800 text-gray-300 cursor-not-allowed opacity-50" 
                  : "border-gray-700 text-banan-primary focus:outline-none focus:border-banan-primary"
              }`} 
            />
          </form>
        </>
      )}
    </div>
  )
}