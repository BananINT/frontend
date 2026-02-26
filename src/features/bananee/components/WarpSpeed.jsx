import React, { useEffect, useRef } from 'react'

export default function WarpSpeed() {
  const canvasRef = useRef(null)
  const requestRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    let width = window.innerWidth
    let height = window.innerHeight
    
    // Set canvas size
    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    window.addEventListener('resize', handleResize)
    handleResize()

    // Configuration
    const speed = 25 // Speed of stars
    const starCount = 600 // Number of stars
    const starSpread = 1000 // How spread out they are in 3D space
    const center = { x: width / 2, y: height / 2 }
    
    // Initialize stars
    // Each star has x, y, z. z is depth (far away).
    const stars = new Array(starCount).fill().map(() => ({
      x: (Math.random() - 0.5) * starSpread * 2,
      y: (Math.random() - 0.5) * starSpread * 2,
      z: Math.random() * starSpread
    }))

    const render = () => {
      // Clear with a slight fade trail for extra motion blur (optional, or solid clear)
      // Solid clear looks cleaner for "sharp" lightspeed lines
      ctx.fillStyle = 'rgba(0, 0, 0, 1)' 
      ctx.fillRect(0, 0, width, height)

      // Update center in case of resize
      center.x = width / 2
      center.y = height / 2

      stars.forEach(star => {
        // Move star closer
        star.z -= speed

        // Reset star if it passes the camera
        if (star.z <= 0) {
          star.z = starSpread
          star.x = (Math.random() - 0.5) * starSpread * 2
          star.y = (Math.random() - 0.5) * starSpread * 2
        }

        // Project 3D coordinates to 2D
        // similar triangles: screenX / fov = x / z
        const prevZ = star.z + speed // The position one frame ago
        
        // Current Position
        const k = 256 / star.z // Field of view constant
        const px = star.x * k + center.x
        const py = star.y * k + center.y

        // Previous Position (to draw the tail)
        const prevK = 256 / prevZ
        const prevPx = star.x * prevK + center.x
        const prevPy = star.y * prevK + center.y

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          // Calculate opacity based on depth (fades in as it gets closer)
          const alpha = (1 - star.z / starSpread)
          
          // Draw the streak
          ctx.beginPath()
          ctx.lineWidth = alpha * 3 // Thicker as it gets closer
          ctx.strokeStyle = `rgba(250, 255, 255, ${alpha})` // White/Yellow tint
          ctx.moveTo(prevPx, prevPy)
          ctx.lineTo(px, py)
          ctx.stroke()
        }
      })

      requestRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(requestRef.current)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full animate-in fade-in duration-1000"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}