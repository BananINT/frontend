import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function SlipOMeter({ ws }){
  const [count, setCount] = useState(0)
  const [justSlipped, setJustSlipped] = useState(false)
  const [isCooldown, setIsCooldown] = useState(false)

  useEffect(()=>{
    if(!ws) return
    const handler = (e)=>{
      try{
        const msg = JSON.parse(e.data)
        if(msg.type === 'slip') setCount(msg.count)
      }catch{}
    }
    ws.addEventListener('message', handler)
    
    const requestSlip = () => {
      ws.send(JSON.stringify({ type: 'get_slip' }))
    }
    
    if (ws.readyState === WebSocket.OPEN) {
      requestSlip()
    } else {
      ws.addEventListener('open', requestSlip)
    }

    return () => {
      ws.removeEventListener('message', handler)
      ws.removeEventListener('open', requestSlip)
    }
  },[ws])

  const slip = async ()=>{
    if (isCooldown) return

    // Activate cooldown for 2 seconds (matches server rate limit)
    setIsCooldown(true)
    setTimeout(() => setIsCooldown(false), 2000)

    if(ws && ws.readyState === WebSocket.OPEN){
      ws.send(JSON.stringify({ type: 'inc_slip' }))
    } else {
      // optimistic local bump if disconnected
      setCount(c => c + 1)
    }

    setJustSlipped(true)
    setTimeout(()=>setJustSlipped(false),200)
    
    const audio = new Audio('/bananee/sfx/banana-peel-slip.mp3')
    audio.volume = 0.5
    audio.play().catch(()=>{})
  }

  return (
    <div className="border-t border-banan-primary p-6 bg-gray-900/30 relative">
      <h3 className="font-mono text-xs text-gray-400 mb-2 uppercase tracking-widest">Compteur global de glissades</h3>
      <div className="flex items-center gap-4">
        <button 
          onClick={slip} 
          disabled={isCooldown}
          className={`transition-all font-black px-6 py-4 uppercase tracking-tighter text-xl 
            ${isCooldown 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed scale-95 opacity-50' 
              : 'active:scale-95 bg-banan-primary text-banan-background hover:bg-white hover:shadow-[0_0_20px_rgba(var(--banan-primary-rgb,250,255,0),0.7)]'
            }`}
        >
          {isCooldown ? 'RECHARGEMENT...' : 'DÉCLENCHER UNE GLISSADE'}
        </button>
        <div className="font-mono text-5xl text-banan-primary tabular-nums tracking-tighter">{count.toLocaleString()}</div>
      </div>
      {justSlipped && (
        <motion.div initial={{opacity:1,y:0}} animate={{opacity:0,y:-20}} className="absolute text-banan-primary font-black text-4xl pointer-events-none ml-20">OUPS !</motion.div>
      )}
    </div>
  )
}