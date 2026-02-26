import React, { useEffect, useState } from 'react'

export default function Countdown({ isMidnight, redir }) {
  const [timeLeft, setTimeLeft] = useState('00:00:00')

  useEffect(() => {
    const tick = () => {
      if (isMidnight) {
        setTimeLeft("00:00:00")
        return
      }

      const now = new Date()
      // Target: Next January 1st at 00:00:00
      const target = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0)
      const diff = target - now

      if (diff <= 0) {
        setTimeLeft("00:00:00")
        return
      }

      // Calculate total hours to keep the HH:MM:SS format
      const totalSeconds = Math.floor(diff / 1000)
      const h = Math.floor(totalSeconds / 3600)
      const m = Math.floor((totalSeconds % 3600) / 60)
      const s = totalSeconds % 60

      setTimeLeft(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      )
    }

    // Run immediately and then every second
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isMidnight])

  return (
    <>
      { isMidnight ? (
        <a 
          onClick={() => redir()}
          className="border border-banan-primary bg-banan-primary/10 p-6 flex flex-col items-center justify-center text-center hover:bg-banan-primary hover:text-banan-background transition-all group cursor-pointer"
        >
          <h2 className="text-xl font-black uppercase mb-2 group-hover:tracking-widest transition-all">
            EXPLORER LA MISE À JOUR BANANIQUE !
          </h2>
          <p className="font-mono text-xs animate-pulse">
            {'>>>'} ACCÉDER AU MINI-JEU {'<<<'}<br/>
          </p>
        </a>
      ) : (
        
        <div className="border border-gray-800 p-6 bg-gray-900/20">
          <h2 className="text-banan-primary text-sm font-bold mb-4 uppercase">Compte à Rebours</h2>
          <div className="text-5xl font-mono text-white tabular-nums tracking-widest">
            {timeLeft}
          </div>
        </div>
      )}
    </>
  )
}