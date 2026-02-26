import React, { useEffect, useRef } from 'react'

export default function BananaRain({ active }){
  const canvasRef = useRef(null)

  useEffect(()=>{
    const canvas = canvasRef.current
    if(!canvas) return
    const ctx = canvas.getContext('2d')
    
    if(!active) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      return
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    resize()

    const chars = "POTASSIUM"
    const fontSize = 16
    const columns = Math.floor(canvas.width / fontSize)
    const drops = Array(columns).fill(1)

    const draw = ()=>{
      // Slight fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--banan-primary').trim() || '#FAFF00';
      ctx.fillStyle = primaryColor
      ctx.font = `bold ${fontSize}px monospace`
      
      for(let i = 0; i < drops.length; i++){
        const text = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)
        
        if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }
    const id = setInterval(draw, 40)
    
    return () => {
      clearInterval(id)
      window.removeEventListener('resize', resize)
    }
  },[active])

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full pointer-events-none opacity-40 mix-blend-screen" 
    />
  )
}