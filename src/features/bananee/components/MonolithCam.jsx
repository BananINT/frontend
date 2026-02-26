import React from 'react'

export default function MonolithCam(){
  return (
    <div className="border border-banan-primary p-1 bg-black/50 backdrop-blur-sm relative overflow-hidden group">
      <div className="absolute top-2 left-2 bg-banan-primary text-banan-background text-xs font-bold px-1 animate-pulse">FLUX EN DIRECT :: LABO 04</div>
      <div className="relative aspect-square bg-gradient-to-b from-gray-900 to-black flex items-center justify-center overflow-hidden">
        <div className="w-32 h-64 bg-banan-primary/20 relative animate-float shadow-[0_0_50px_rgba(var(--banan-primary-rgb,250,255,0),0.3)]">
            <img src="/bananee/img/banane.webp" alt="Banane" className="w-full h-full drop-shadow-lg"/>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] pointer-events-none" />
        <div className="absolute inset-0 opacity-10 bg-noise pointer-events-none animate-noise" />
      </div>
      <div className="p-2 font-mono text-xs text-banan-primary flex justify-between flex-col lg:flex-row">
        <span>CAM_01</span>
        <span>MATURITÉ : 0,0 %</span>
      </div>
    </div>
  )
}
