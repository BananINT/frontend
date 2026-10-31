import React, { useEffect, useRef, useState } from 'react'
import { isMobileDevice } from '../lib/utils'

export default function DesktopProxy({ url }) {
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800, scale: 1 })
  const [needsInteraction, setNeedsInteraction] = useState(true)
  
  // 1. Calculate Scale Logic (Responsive)
  useEffect(() => {
    const calculateLayout = () => {
      const screenW = window.innerWidth
      const screenH = window.innerHeight
      const VIRTUAL_WIDTH = 1200
      const scale = screenW / VIRTUAL_WIDTH
      const virtualHeight = screenH / scale

      setDimensions({
        width: VIRTUAL_WIDTH,
        height: virtualHeight,
        scale: scale
      })
    }

    calculateLayout()
    window.addEventListener('resize', calculateLayout)
    window.addEventListener('orientationchange', () => setTimeout(calculateLayout, 500))
    
    return () => {
      window.removeEventListener('resize', calculateLayout)
      window.removeEventListener('orientationchange', calculateLayout)
    }
  }, [])

  // 2. Listen for Fullscreen Exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement || 
                           document.webkitFullscreenElement || 
                           document.mozFullScreenElement || 
                           document.msFullscreenElement

      // If we are NOT in fullscreen, show the button
      if (!isFullscreen) {
        setNeedsInteraction(true)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange) // Safari/Chrome
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)    // Firefox
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)     // IE/Edge

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  // 3. Trigger Fullscreen
  const enterFullscreenAndPlay = async () => {
    // Hide overlay immediately (optimistic UI)
    setNeedsInteraction(false)

    if (containerRef.current) {
      try {
        const elem = containerRef.current
        if (elem.requestFullscreen) {
          await elem.requestFullscreen()
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen()
        } else if (elem.msRequestFullscreen) {
          await elem.msRequestFullscreen()
        }
      } catch (err) {
        // If fullscreen is denied (e.g. iPhone), we stay in "viewport" mode
        // The overlay remains hidden so they can play.
        console.warn("Fullscreen request denied or not supported:", err)
      }
    }
  }

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 bg-black z-[9999] overflow-hidden m-0 p-0"
    >
      <div 
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          transform: `scale(${dimensions.scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0,
          overflow: 'hidden'
        }}
      >
        <iframe 
          src={url}
          className="w-full h-full border-0 block"
          allow="autoplay; fullscreen; microphone; camera; midi; encrypted-media"
          title="Starblast Proxy"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* --- INTERACTION OVERLAY --- */}
      {needsInteraction && (
        <div 
          role="button"
          tabIndex={0}
          onClick={enterFullscreenAndPlay}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              enterFullscreenAndPlay()
            }
          }}
          className="absolute inset-0 z-[10000] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-banan-primary bg-black/90 flex flex-col items-center justify-center cursor-pointer animate-in fade-in duration-500 backdrop-blur-sm"
        >
          <div className="text-banan-primary border-2 border-banan-primary p-6 text-center animate-pulse hover:bg-banan-primary/10 transition-colors">
            <h2 className="text-2xl font-black uppercase mb-2">MODE IMMERSIF</h2>
            <p className="font-mono text-sm uppercase tracking-widest">
              TAPPEZ POUR {isMobileDevice() ? 'JOUER' : 'REVENIR EN PLEIN ÉCRAN'}
            </p>
          </div>
        </div>
      )}

      {/* Orientation Hint (Only show if we are actively playing) */}
      {!needsInteraction && dimensions.height > dimensions.width && (
         <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-banan-primary text-[10px] px-2 py-1 rounded border border-banan-primary pointer-events-none animate-pulse z-[10001]">
           Tournez l'écran ⟳
         </div>
      )}
    </div>
  )
}