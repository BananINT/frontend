import React, { useEffect, useRef } from 'react'

export default function VirtualFireworks() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let particles = []
    let animationFrame

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    class Particle {
      constructor(x, y, color) {
        this.x = x
        this.y = y
        this.size = Math.random() * 8 + 4 // Blocky size
        this.speedX = (Math.random() - 0.5) * 15
        this.speedY = (Math.random() - 0.5) * 15
        this.color = color
        this.life = 100
      }
      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.life -= 1.5
      }
      draw() {
        ctx.fillStyle = this.color
        // Drawing squares for that 8-bit look
        ctx.fillRect(this.x, this.y, this.size, this.size)
      }
    }

    const createExplosion = (x, y) => {
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--banan-primary').trim() || '#FAFF00';
      for (let i = 0; i < 40; i++) {
        const color = Math.random() > 0.5 ? primaryColor : '#FFFFFF';
        particles.push(new Particle(x, y, color))
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Randomly spawn explosions
      if (Math.random() > 0.9) {
        createExplosion(Math.random() * canvas.width, Math.random() * canvas.height)
      }

      particles = particles.filter(p => p.life > 0)
      particles.forEach(p => {
        p.update()
        p.draw()
      })

      animationFrame = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationFrame)
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 z-20 pointer-events-none" />
}