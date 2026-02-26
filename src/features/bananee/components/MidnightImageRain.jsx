import React, { useEffect, useRef } from 'react'

export default function MidnightImageRain() {
  const canvasRef = useRef(null)
  const imagePath = '/bananee/img/bananee.webp' 

  useEffect(() => {
    const canvas = canvasRef.current
    if(!canvas) return
    const ctx = canvas.getContext('2d')
    let frameId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    resize()

    const img = new Image()
    img.src = imagePath
    let loaded = false
    img.onload = () => { loaded = true }

    const nbParticles = (window.innerWidth < 1024) ? 15 : 50;

    const particles = Array.from({ length: nbParticles }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height, // Start above screen
      speed: 4 + Math.random() * 8,
      size: 100 + Math.random() * 50,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 4
    }))

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (loaded) {
        particles.forEach(p => {
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rotation * Math.PI / 180)
          ctx.drawImage(img, -p.size / 2, -p.size / 2, p.size, p.size)
          ctx.restore()

          p.y += p.speed
          p.rotation += p.rotSpeed
          if (p.y > canvas.height + 100) {
            p.y = -100
            p.x = Math.random() * canvas.width
          }
        })
      }
      frameId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(frameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full pointer-events-none" />
}