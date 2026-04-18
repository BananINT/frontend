import React, { useEffect, useState, useRef } from 'react'
import BananaRain from './BananaRain'
import MonolithCam from './MonolithCam'
import SlipOMeter from './SlipOMeter'
import FrictionlessChat from './FrictionlessChat'
import Oracle from './Oracle'
import MidnightImageRain from './MidnightImageRain'
import VirtualFireworks from './VirtualFireworks'
import Ticker from './Ticker'
import Header from './Header'
import Countdown from './Countdown'
import WarpSpeed from './WarpSpeed'
import DesktopProxy from './DesktopProxy'
import { wsUrl } from '../lib/api'
import { isMobileDevice } from '../lib/utils'

export default function MainStage() {
  const [midnightPhase, setMidnightPhase] = useState(0) 
  const [gameMode, setGameMode] = useState(false) 
  const [ws, setWs] = useState(null)
  const [chatFolded, setChatFolded] = useState(false)
  const [username, setUsername] = useState(() => (typeof window !== 'undefined' && localStorage.getItem('cult_name')) || '')
  
  const [finalGameUrl, setFinalGameUrl] = useState(null)

  const [isMuted, setIsMuted] = useState(false)
  const isMutedRef = useRef(false)

  const toggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    isMutedRef.current = newMuted
    if (bgMusicRef.current) {
      bgMusicRef.current.muted = newMuted
    }
  }

  // --- Audio State ---
  const [visualScale, setVisualScale] = useState(1)
  const bgMusicRef = useRef(null)
  const bgTimerRef = useRef(null)
  const midnightAudioRef = useRef(null)
  const sequenceTriggeredRef = useRef(false)
  const audioContextReadyRef = useRef(false)

  // --- Web Audio Refs ---
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const dataArrayRef = useRef(null)
  const animationFrameRef = useRef(null)
  const connectedElements = useRef(new WeakSet())

  const initAnalyser = (audioElement) => {
    if (!audioElement) return
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    const ctx = audioContextRef.current
    if (ctx.state === 'suspended') ctx.resume()
    if (!analyserRef.current) {
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 128 
      analyserRef.current = analyser
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
    }
    if (!connectedElements.current.has(audioElement)) {
      try {
        const source = ctx.createMediaElementSource(audioElement)
        source.connect(analyserRef.current)
        analyserRef.current.connect(ctx.destination)
        connectedElements.current.add(audioElement)
      } catch (err) {
        console.warn("Audio connection error:", err)
      }
    }
    const updateVisuals = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current)
        const sum = dataArrayRef.current.reduce((a, b) => a + b, 0)
        const avg = sum / dataArrayRef.current.length
        const newScale = 1 + (avg / 255) * 0.2
        setVisualScale(newScale)
      }
      animationFrameRef.current = requestAnimationFrame(updateVisuals)
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    updateVisuals()
  }

  useEffect(() => {
    midnightAudioRef.current = new Audio('/bananee/sfx/midnight-event.mp3')
    midnightAudioRef.current.crossOrigin = "anonymous"

    const playRandomBgMusic = () => {
      if (sequenceTriggeredRef.current) return

      if (bgTimerRef.current) clearTimeout(bgTimerRef.current)
      
      if (bgMusicRef.current) {
        bgMusicRef.current.onended = null 
        bgMusicRef.current.pause()
        bgMusicRef.current = null
      }

      const trackId = Math.floor(Math.random() * 27) + 1
      const audio = new Audio(`/bananee/music/${trackId}.mp3`)
      audio.volume = 0.5
      audio.muted = isMutedRef.current
      audio.crossOrigin = "anonymous"
      bgMusicRef.current = audio
      
      audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && isFinite(audio.duration)) {
           const safeMax = Math.max(0, audio.duration - 5)
           audio.currentTime = Math.random() * safeMax
        }
      })
      
      audio.addEventListener('play', () => initAnalyser(audio))
      audio.onended = playRandomBgMusic
      
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          if (error.name === 'NotAllowedError') {
            const enableAudio = () => {
              if (audioContextReadyRef.current) return
              audioContextReadyRef.current = true
              playRandomBgMusic()
              window.removeEventListener('click', enableAudio)
              window.removeEventListener('keydown', enableAudio)
            }
            window.addEventListener('click', enableAudio)
            window.addEventListener('keydown', enableAudio)
          } else if (error.name !== 'AbortError') {
             console.error("Background music play error:", error)
          }
        })
      }

      bgTimerRef.current = setTimeout(playRandomBgMusic, 30000)
    }

    playRandomBgMusic()
    
    const socket = new WebSocket(wsUrl())
    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === 'midnight') {
            activateMidnightSequence(data)
        }
      } catch {}
    }
    setWs(socket)

    return () => {
      if (bgTimerRef.current) clearTimeout(bgTimerRef.current)
      if (bgMusicRef.current) {
        bgMusicRef.current.onended = null
        bgMusicRef.current.pause()
      }
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (socket) socket.close()
    }
  }, [])

  const activateMidnightSequence = (payload = {}) => {
    if (sequenceTriggeredRef.current && !payload.forceSync) return;
    
    if (payload.game_url) setFinalGameUrl(payload.game_url);
    
    sequenceTriggeredRef.current = true;
    if (bgTimerRef.current) clearTimeout(bgTimerRef.current);

    const P1_END = 22;
    const P2_END = 63;
    const P3_END = 74;

    const nowSec = Date.now() / 1000;
    const elapsed = payload.started_at ? (nowSec - payload.started_at) : 0;

    if (elapsed < P3_END) {
      if (bgMusicRef.current) bgMusicRef.current.pause();
      
      if (midnightAudioRef.current) {
        initAnalyser(midnightAudioRef.current);
        midnightAudioRef.current.currentTime = Math.max(0, elapsed);
        midnightAudioRef.current.play().catch(e => console.warn("Audio blocked", e));
      }
    }

    if (elapsed < P1_END) {
      setMidnightPhase(1);
      setTimeout(() => setMidnightPhase(2), (P1_END - elapsed) * 1000);
      setTimeout(() => setMidnightPhase(3), (P2_END - elapsed) * 1000);
      setTimeout(() => doRedirect(payload.game_url), (P3_END - elapsed) * 1000);
    } 
    else if (elapsed < P2_END) {
      setMidnightPhase(2);
      setTimeout(() => setMidnightPhase(3), (P2_END - elapsed) * 1000);
      setTimeout(() => doRedirect(payload.game_url), (P3_END - elapsed) * 1000);
    } 
    else if (elapsed < P3_END) {
      setMidnightPhase(3);
      setTimeout(() => doRedirect(payload.game_url), (P3_END - elapsed) * 1000);
    } 
    else {
      // EVENT ALREADY FINISHED
      // We do NOT redirect automatically.
      // We just set the phase to 4 so the UI shows the button.
      setMidnightPhase(4);
    }
  };

  const doRedirect = (url) => {
    if (midnightAudioRef.current) {
      midnightAudioRef.current.pause()
    }
    
    const target = url || finalGameUrl || "https://starblast.io/"

    if (isMobileDevice()) {
      setGameMode(true) 
    } else {
      window.location.href = target
    }
  }

  const handleSetUsername = (newName) => {
    if (newName && newName.trim()) {
      const cleaned = newName.trim()
      setUsername(cleaned)
      localStorage.setItem('cult_name', cleaned)
    }
  }

  const promptForUsername = () => {
    const newName = window.prompt("IDENTIFIEZ-VOUS (pour le protocole) :", username)
    handleSetUsername(newName)
  }

  if (gameMode) {
    const target = finalGameUrl || "https://starblast.io/"
    return <DesktopProxy url={target} />
  }

  return (
    <>
      {/* --- MIDNIGHT SEQUENCE --- */}
      {((0 < midnightPhase) && (midnightPhase < 4)) && (
        <div className="absolute inset-0 z-[100] bg-black overflow-hidden flex items-center justify-center select-none touch-none">
          <div className="absolute inset-0 z-0 pointer-events-none">
            {midnightPhase === 1 && <BananaRain active={true} />}
            {midnightPhase === 2 && (
              <>
                <VirtualFireworks />
                <MidnightImageRain />
              </>
            )}
            {midnightPhase === 3 && <WarpSpeed />}
          </div>
          
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/80 via-transparent to-black/80 pointer-events-none" />
          
          <div className="relative z-20 w-full px-6 flex flex-col items-center justify-center text-center pointer-events-none">
            {midnightPhase === 1 && (
              <div className="animate-in fade-in zoom-in duration-700">
                <h1 className="text-6xl sm:text-8xl md:text-[12rem] font-black text-banan-primary leading-none uppercase animate-pulse-glow">
                  Minuit
                </h1>
                <p className="text-white font-mono tracking-[0.3em] sm:tracking-[1em] text-base sm:text-2xl mt-6 opacity-80 animate-pulse">
                  INITIALISATION
                </p>
              </div>
            )}
            {midnightPhase === 2 && (
              <div className="animate-in zoom-in duration-1000">
                <h1 
                  style={{ 
                    transform: `scale(${visualScale})`,
                    transition: 'transform 0.05s cubic-bezier(0.1, 0, 0.3, 1)' 
                  }}
                  className="text-4xl sm:text-6xl md:text-9xl font-black text-banan-primary italic drop-shadow-[0_0_40px_rgba(var(--banan-primary-rgb,250,255,0),0.7)] leading-none uppercase will-change-transform"
                >
                  Bananée
                </h1>
                <p className="text-white font-mono tracking-[0.2em] sm:tracking-[0.5em] text-base sm:text-2xl mt-4 uppercase">
                  Première résolution: <br/>
                  Faire un régime <br/>
                  ... <br/>
                  DE BANANES !
                </p>
              </div>
            )}
            {midnightPhase === 3 && (
              <div className="absolute top-8 sm:top-12 left-0 right-0 px-4 animate-in slide-in-from-top duration-700">
                <h2 className="text-banan-primary text-3xl sm:text-5xl md:text-6xl font-black uppercase drop-shadow-lg leading-tight animate-pulse-glow">
                  Récolte Finale
                </h2>
                <div className="flex items-center justify-center gap-2 sm:gap-4 mt-2">
                  <span className="hidden sm:block h-[1px] w-8 bg-banan-primary/50" />
                  <p className="text-white/70 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em]">
                    Téléportation...
                  </p>
                  <span className="hidden sm:block h-[1px] w-8 bg-banan-primary/50" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Header />

      <div className="pt-8 lg:pt-12 pb-8 lg:pb-12 h-full grid grid-cols-1 lg:grid-cols-12 relative z-10">
        <div className="lg:col-span-8 p-6 flex flex-col gap-8 overflow-y-auto lg:overflow-hidden scrollbar-hide">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="w-1/2 md:w-1/4"><MonolithCam /></div>
            <div className="w-full md:w-3/4">
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-banan-primary leading-[0.85] tracking-tighter uppercase">
                Mise à jour<br/>bananesque
              </h1>
              <p className="mt-4 text-gray-400 font-mono text-sm max-w-md border-l-2 border-banan-primary pl-4">
                Épluchage des bugs, déploiement du patch fruité.<br/>
                Migration vers la VERSION_BANANIQUE: v{new Date().getFullYear() + 1}.
              </p>
              <button
                onClick={toggleMute}
                className="mt-4 text-banan-primary font-bold font-mono text-xs hover:bg-banan-primary hover:text-banan-background px-4 py-2 border border-banan-primary transition-all uppercase w-max"
              >
                {isMuted ? "RÉACTIVER LA MUSIQUE" : "COUPER LA MUSIQUE"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Countdown 
              isMidnight={(midnightPhase != 0)} 
              gameUrl={finalGameUrl} 
              redir={doRedirect} 
            />
            <SlipOMeter ws={ws} />
          </div>

          <Oracle />

          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-gray-600 text-[10px] font-mono mb-2 uppercase tracking-widest">Identification du Sujet</div>
            <button 
              onClick={promptForUsername}
              className="text-banan-primary font-bold font-mono text-xs hover:bg-banan-primary hover:text-banan-background px-4 py-2 border border-banan-primary transition-all uppercase"
            >
              {username ? `ID: ${username}` : 'S\'IDENTIFIER'}
            </button>
          </div>
        </div>

        <div className={`lg:col-span-4 ${chatFolded ? 'h-auto' : 'h-[40vh]'} lg:h-full lg:overflow-hidden flex flex-col transition-all duration-300 ease-in-out`}>
          <FrictionlessChat 
            ws={ws} 
            isFolded={chatFolded} 
            onToggleFold={() => setChatFolded(!chatFolded)} 
            username={username}
            onSetUsername={handleSetUsername}
          />
        </div>
      </div>

      <Ticker />
    </>
  )
}