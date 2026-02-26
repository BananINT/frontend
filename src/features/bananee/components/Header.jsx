import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function Header(){
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const calculateProgress = () => {
      const now = new Date()
      // Calculate progress through the current year
      const start = new Date(now.getFullYear(), 0, 1)
      const end = new Date(now.getFullYear() + 1, 0, 1)
      const progress = (now - start) / (end - start) * 100
      setPct(progress)
    }
    
    calculateProgress()
    // Update fast enough to see the decimals move
    const interval = setInterval(calculateProgress, 100) 
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute top-0 left-0 w-full z-40 bg-banan-background border-b border-banan-primary">
      <div className="flex items-center justify-between px-4 py-2 text-xs font-mono text-banan-primary">
        <span>VERSION_BANANIQUE: v{new Date().getFullYear()}</span>
        <span className="text-right">MISE À JOUR v{new Date().getFullYear() + 1}... {pct.toFixed(6)}%</span>
      </div>
      <motion.div 
        className="h-1 bg-banan-primary shadow-[0_0_10px_rgba(var(--banan-primary-rgb,250,255,0),0.7)]" 
        initial={{ width: 0 }} 
        animate={{ width: `${pct}%` }} 
        transition={{ ease: 'linear', duration: 0.1 }} 
      />
    </div>
  )
}