import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ShieldAlert,
  KeyRound,
  Eye,
  UserX,
  Gamepad2,
  CheckCircle2,
  X,
  Lock,
} from 'lucide-react';

interface CyberLabWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CYBERLAB_PRIVACY_KEY = 'cyberlab_privacy_warning_acknowledged';

export function CyberLabWarningModal({ isOpen, onClose }: CyberLabWarningModalProps) {
  const [hasAcknowledged, setHasAcknowledged] = useState<boolean>(() => {
    return localStorage.getItem(CYBERLAB_PRIVACY_KEY) === 'true';
  });
  const [isChecked, setIsChecked] = useState<boolean>(() => {
    return localStorage.getItem(CYBERLAB_PRIVACY_KEY) === 'true';
  });

  const handleCheckboxChange = (checked: boolean) => {
    setIsChecked(checked);
    if (!checked) {
      // Immediately revoke approval and lock the terminal
      localStorage.removeItem(CYBERLAB_PRIVACY_KEY);
      setHasAcknowledged(false);
    }
  };

  const handleConfirmAndDismiss = () => {
    if (!isChecked) return;
    localStorage.setItem(CYBERLAB_PRIVACY_KEY, 'true');
    setHasAcknowledged(true);
    onClose();
  };

  if (!isOpen) return null;

  // Can only dismiss if box is checked AND previously acknowledged
  const canDismiss = hasAcknowledged && isChecked;

  return (
    <AnimatePresence>
      <div className="fixed top-12 bottom-0 inset-x-0 z-40 flex items-center justify-center p-3 sm:p-6 overflow-y-auto backdrop-blur-xl bg-black/85">
        {/* Animated Backdrop Dimming - Leaves top navbar (h-12) uncovered */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (canDismiss) onClose();
          }}
          className="fixed top-12 bottom-0 inset-x-0 cursor-default"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-neutral-950/95 border-2 border-red-500/70 rounded-2xl shadow-[0_0_50px_rgba(255,0,85,0.35)] overflow-hidden my-auto flex flex-col font-sans z-10"
        >
          {/* Top Hazard Warning Strip */}
          <div className="h-3 w-full bg-[repeating-linear-gradient(45deg,#FF0055,#FF0055_14px,#111_14px,#111_28px)]" />

          {/* Header section with Close Button if previously acknowledged AND checked */}
          <div className="p-4 sm:p-6 pb-3 flex items-start justify-between gap-4 border-b border-red-500/20 bg-red-950/20">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 sm:p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex-shrink-0 animate-pulse">
                <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] sm:text-xs font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded bg-red-500 text-black">
                    PROTOCOLE DE SÉCURITÉ OPÉRATIONNELLE
                  </span>
                  <span className="text-[11px] font-mono text-red-400/80 font-bold">
                    [ZONE NON CONFIDENTIELLE]
                  </span>
                </div>
                <h2 className="text-base sm:text-xl font-black uppercase tracking-wide text-white mt-1">
                  Ne saisissez jamais de données privées
                </h2>
              </div>
            </div>

            {canDismiss && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer"
                title="Fermer la notice"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed overflow-y-auto max-h-[55vh] custom-scrollbar">
            {/* Lead Warning Banner */}
            <div className="p-3 sm:p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-200 font-mono text-xs sm:text-sm font-semibold flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-300 uppercase tracking-wide">
                  ATTENTION : CE TERMINAL EST ENTIÈREMENT PUBLIC (SORT OF)
                </p>
                <p className="mt-1 text-white/90">
                  Tous les messages envoyés dans le CyberLab sont transmis à des modèles d'intelligence artificielle et sont susceptibles d'apparaître dans les journaux d'audit techniques. 
                  <span className="text-yellow-300 font-bold"> Ne traitez JAMAIS ce chat comme un coffre-fort secret.</span>
                </p>
              </div>
            </div>

            {/* 4 Crucial Warning Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Pillar 1: Passwords & Credentials */}
              <div className="p-3.5 rounded-xl border border-red-500/30 bg-black/60 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-red-400 font-mono font-bold text-xs">
                  <KeyRound className="w-4 h-4 flex-shrink-0" />
                  <span>AUCUN MOT DE PASSE</span>
                </div>
                <p className="text-[12px] text-white/80 leading-snug">
                  Ne tapez <strong className="text-red-300">JAMAIS</strong> vos mots de passe, clés d'API, tokens JWT, seed phrases crypto, codes d'accès ou numéros de carte bancaire.
                </p>
              </div>

              {/* Pillar 2: Public Pipeline & Logs */}
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-black/60 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs">
                  <Eye className="w-4 h-4 flex-shrink-0" />
                  <span>AUCUN CHIFFREMENT E2E</span>
                </div>
                <p className="text-[12px] text-white/80 leading-snug">
                  Vos requêtes transitent en clair vers les serveurs d'inférence. Considérez chaque consigne saisie comme <strong className="text-amber-300">potentiellement lisible</strong>.
                </p>
              </div>

              {/* Pillar 3: Real Names & PII */}
              <div className="p-3.5 rounded-xl border border-yellow-500/30 bg-black/60 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-yellow-400 font-mono font-bold text-xs">
                  <UserX className="w-4 h-4 flex-shrink-0" />
                  <span>PAS DE NOMS RÉELS</span>
                </div>
                <p className="text-[12px] text-white/80 leading-snug">
                  Restez anonyme. Ne mentionnez aucun nom réel, adresse postale, numéro de téléphone, employeur ou donnée personnelle identifiable (PII).
                </p>
              </div>

              {/* Pillar 4: Gaming Context */}
              <div className="p-3.5 rounded-xl border border-banan-primary/30 bg-black/60 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-banan-primary font-mono font-bold text-xs">
                  <Gamepad2 className="w-4 h-4 flex-shrink-0" />
                  <span>JEU & SIMULATION ONLY</span>
                </div>
                <p className="text-[12px] text-white/80 leading-snug">
                  Les personas (Bananabot, Architect, Gekko, PalantINT) sont des entités de jeu de rôle BananINT. Utilisez exclusivement des alias et des données fictives.
                </p>
              </div>
            </div>

            {/* Practical Advice */}
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10 text-white/70 text-[11px] font-mono">
              💡 <span className="text-white font-bold">Règle de conduite :</span> Utilisez uniquement votre pseudonyme de Bananier, des métriques de jeu publiques ou du code de test sans secrets.
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 pt-3 border-t border-white/10 bg-black/90 flex flex-col gap-3">
            {/* Mandatory Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => handleCheckboxChange(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-red-500/60 bg-black text-red-500 focus:ring-red-500 focus:ring-offset-black cursor-pointer accent-red-500"
              />
              <span className="text-xs sm:text-sm text-white/90 group-hover:text-white leading-snug">
                J'ai lu et compris que ce terminal <strong className="text-red-400">n'est pas confidentiel</strong>. Je m'engage formellement à ne transmettre aucun mot de passe, secret ni information privée.
              </span>
            </label>

            {/* Lockout Warning Banner if Unchecked */}
            {!isChecked && (
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-red-950/70 border border-red-500/60 text-red-200 text-xs font-mono">
                <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 animate-pulse" />
                <span className="font-bold">
                  TERMINAL BLOQUÉ : Vous devez cocher la case d'acceptation ci-dessus pour déverrouiller le CyberLab.
                </span>
              </div>
            )}

            {/* Confirm & Unlock Button */}
            <div className="flex items-center justify-between gap-3 pt-1">
              {canDismiss ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Fermer cette notice
                </button>
              ) : (
                <div className="text-[11px] font-mono text-red-400/80 flex items-center gap-1.5 font-bold">
                  <Lock className="w-3.5 h-3.5 text-red-400" />
                  <span>Terminal verrouillé</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirmAndDismiss}
                disabled={!isChecked}
                className="ml-auto px-5 py-2.5 rounded-xl font-mono font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed bg-red-600 hover:bg-red-500 text-white shadow-red-950/60 hover:shadow-red-600/30"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>
                  {canDismiss ? 'Enregistrer & Déverrouiller' : "J'ai compris — Déverrouiller le CyberLab"}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
