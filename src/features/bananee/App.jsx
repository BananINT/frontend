import React, { useState, Suspense, lazy } from 'react'
import { AnimatePresence } from 'framer-motion'
import PeelOverlay from './components/PeelOverlay'
const MainStage = lazy(() => import('./components/MainStage'))

import './App.css'

export default function App(){
  const [unlocked, setUnlocked] = useState(false)

  return (
    // Height adjusted to fit under the navbar (assumed exactly 48px or 3rem minimum layout height)
    <div className="w-full h-[calc(100vh-3rem)] bg-banan-background overflow-hidden relative font-sans text-white selection:bg-banan-primary selection:text-banan-background">

      <AnimatePresence>
        {!unlocked && (
          <PeelOverlay key="peel" onUnlock={() => setUnlocked(true)} />
        )}
      </AnimatePresence>

      {unlocked && (
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center text-banan-primary font-mono animate-pulse">
            DÉVERROUILLAGE…
          </div>
        }>
          <MainStage />
        </Suspense>
      )}
    </div>
  )
}