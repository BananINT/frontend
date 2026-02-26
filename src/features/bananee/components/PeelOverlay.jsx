import React from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

const THEME = { yellow:'var(--banan-primary)' }

export default function PeelOverlay({onUnlock}){
  const y = useMotionValue(0)
  const opacity = useTransform(y, [0, 500], [1, 0])
  const scaleY = useTransform(y, [0, 500], [1, 0.1])

  const handleDragEnd = (_, info) => {
    // Mobile optimization: If they swipe fast (velocity), unlock even if distance is short
    const isFastSwipe = info.velocity.y > 500
    const isFarEnough = info.offset.y > 200
    
    if(isFarEnough || isFastSwipe) onUnlock()
  }

  return (
    <motion.div 
      // touch-none prevents pull-to-refresh
      // Added overflow-hidden to prevent horizontal scroll from large text
      // Changed alignment to center for better mobile view
      className="absolute inset-0 z-[25] flex items-center justify-center cursor-grab active:cursor-grabbing touch-none overflow-hidden" 
      style={{backgroundColor:THEME.yellow, opacity}}
    >
      <motion.div 
        drag="y" 
        dragConstraints={{top:0, bottom:800}} 
        dragElastic={0.2} 
        onDragEnd={handleDragEnd} 
        style={{y, scaleY, originY:0}} 
        // Changed items-start to items-center and removed top padding for better centering
        className="w-full h-[100dvh] absolute top-0 left-0 bg-banan-primary flex items-center justify-center flex-col"
      >
        {/* Adjusted text size for mobile (text-6xl) vs desktop (text-9xl) */}
        <h1 className="text-6xl sm:text-9xl font-black tracking-tighter text-banan-background select-none mix-blend-multiply">{new Date().getFullYear() + 1}</h1>
        
        <div className="mt-8 text-banan-background font-mono text-sm sm:text-xl animate-pulse px-6 text-center">
          ▼ TIREZ POUR PELER LA RÉALITÉ ▼
        </div>
        
        {/* Drastically reduced mobile font size to prevent clipping */}
        <div className="absolute bottom-10 opacity-20 text-banan-background font-black text-2xl sm:text-8xl pointer-events-none whitespace-nowrap">
          NE RÉSISTEZ PAS AU POTASSIUM
        </div>
      </motion.div>
    </motion.div>
  )
}