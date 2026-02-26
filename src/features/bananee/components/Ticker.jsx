import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TICKER_MESSAGES = [
  // Reality & Physics
  "ALERTE: LA RÉALITÉ EST ACTUELLEMENT À 14% BRIX",
  "GRAVITÉ REMPLACÉE PAR LE GLISSEMENT",
  `PRÉVISION ${new Date().getFullYear() + 1}: 100% DE JAUNE`,
  "LA BANANE N'EST PAS UN FRUIT, C'EST UN ÉTAT D'ESPRIT",
  "L'HORIZON EST DÉSORMAIS ENTIÈREMENT TEXTURÉ",
  "LA LOGIQUE A QUITTÉ LE CHAT (ERREUR 404)",
  "LA COURBURE DU TEMPS EST EN DESSOUS DES NORMES SAISONNIÈRES",
  "DÉFAUSSEZ VOTRE PEAU POUR UNE MEILLEURE RÉCEPTION",
  
  // Sector Updates
  "NIVEAUX DE POTASSIUM MAXIMAUX DANS LE SECTEUR 7",
  "SITUATION DU SECTEUR 9: LE JAUNE A GAGNÉ LA BATAILLE",
  "LE SECTEUR 4 N'EXISTE PLUS ET N'A JAMAIS EXISTÉ",
  "URGENT: LE SOLEIL A ÉTÉ DÉPLACÉ POUR MAINTENANCE",
  "PROTOCOLES DE SYNCHRONISATION DU GLISSEMENT ACTIVÉS",
  
  // Biological & Botanical
  "IMPORTATION DE SÉROTONINE VÉGÉTALE EN COURS",
  "VOS SOUVENIRS SONT EN COURS DE DÉFRAGMENTATION",
  "L'INDICE DE CHLOROPHYLLE DÉPASSE LES LIMITES LÉGALES",
  "NE MANGEZ PAS LES PIXELS DU SECTEUR SUD",
  "VOTRE ADN EST EN ATTENTE DE MISE À JOUR (v2.4)",
  
  // Abstract / Cryptic
  "LE SILENCE EST PLUS BRUYANT QUE D'HABITUDE",
  "TOUT VA BIEN. NE REGARDEZ PAS DERRIÈRE L'ÉCRAN",
  "VOTRE OMBRE PREND TROP DE PLACE",
  "LE JAUNE EST LA SEULE VÉRITÉ ACCESSIBLE",
  "SENS INVERSE ACTIVÉ DANS LE CORRIDOR MENTAL",
  "RESTEZ HYDRATÉS, LE VIDE APPROCHE",
  "TICKET #9422: L'EXISTENCE EST UNE FONCTION DÉPRÉCIÉE"
];

export default function Ticker() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * TICKER_MESSAGES.length));
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Check on mount
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(prev => {
        let next = prev;
        while (next === prev) {
          next = Math.floor(Math.random() * TICKER_MESSAGES.length);
        }
        return next;
      });
    }, 8000); // 8 seconds per message
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute bottom-0 left-0 w-full bg-banan-primary text-banan-background text-sm font-bold py-1 overflow-hidden z-50 whitespace-nowrap font-mono border-t border-black/20">
      <div className="h-6 flex items-center px-4 relative">
        {/* Hide static prefix on mobile to maximize space for scrolling */}
        <span className="mr-3 opacity-50 select-none hidden md:inline">+++</span>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            // Mobile: Start off-screen right (100vw), animate to off-screen left (-100%)
            // Desktop: Fade in/up
            initial={isMobile ? { x: "100vw", opacity: 1 } : { opacity: 0, y: 10, x: 0 }}
            animate={isMobile ? { x: "-100%", opacity: 1 } : { opacity: 1, y: 0, x: 0 }}
            // Mobile: Exit instantly so the next one can start (or let it finish off-screen)
            exit={isMobile ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -10 }}
            transition={isMobile 
              ? { duration: 7.8, ease: "linear" } // Slightly less than 8s interval to ensure completion
              : { duration: 0.4, ease: "circOut" }
            }
            // On mobile, absolute positioning allows it to traverse the container freely
            className={`inline-block uppercase tracking-wider ${isMobile ? 'absolute left-0' : ''}`}
          >
            {TICKER_MESSAGES[index]}
          </motion.div>
        </AnimatePresence>

        <span className="ml-3 opacity-50 select-none hidden md:inline">+++</span>
      </div>
    </div>
  )
}