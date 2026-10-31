import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { formatNumber } from '@app/utils/format';

interface LabStatusBarProps {
  canAfford: boolean;
  hasEnoughEnergy: boolean;
  isInferenceOnline: boolean;
  errorMessage: string | null;
  onDismissError: () => void;
  userBananas: number;
  currentCost: number;
  currentEnergy: number;
  promptEnergyCost: number;
}

/** Insufficient Balance / Error Warning Bar above the composer. */
export function LabStatusBar({
  canAfford, hasEnoughEnergy, isInferenceOnline, errorMessage, onDismissError,
  userBananas, currentCost, currentEnergy, promptEnergyCost,
}: LabStatusBarProps) {
  return (
    <AnimatePresence>
      {(!canAfford || !hasEnoughEnergy || !isInferenceOnline || errorMessage) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className={`px-4 py-2 text-xs flex items-center gap-2 border-t font-mono ${
            errorMessage || !isInferenceOnline
              ? 'bg-red-500/15 border-red-500/30 text-red-300'
              : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
          }`}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1 truncate">
            {errorMessage ||
              (!isInferenceOnline
                ? "SERVEUR D'INFÉRENCE HORS LIGNE : L'infrastructure IA n'est pas connectée."
                : !canAfford
                ? `Réserves insuffisantes : ${formatNumber(userBananas)} / ${formatNumber(currentCost)} Bananes requises.`
                : `Énergie insuffisante : ${Math.floor(currentEnergy)}% disponible (${promptEnergyCost}% requis). Recharge en cours (8.3% par heure).`)}
          </span>
          {errorMessage && (
            <button
              type="button"
              onClick={onDismissError}
              className="text-white/60 hover:text-white text-[11px] uppercase underline cursor-pointer"
            >
              Fermer
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
