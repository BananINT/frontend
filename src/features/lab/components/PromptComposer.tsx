import { useRef, useEffect } from 'react';
import { Send, Zap, Banana, ShieldAlert } from 'lucide-react';
import { formatNumber } from '@app/utils/format';
import { getPersonaTheme } from './personaTheme';

interface PromptComposerProps {
  promptInput: string;
  setPromptInput: (val: string) => void;
  onSend: () => void;
  personaId: string;
  personaName?: string;
  currentCost: number;
  canAfford: boolean;
  currentEnergy: number;
  promptEnergyCost?: number;
  isStreaming: boolean;
  isInferenceOnline: boolean;
  cooldownSeconds: number;
  onOpenWarningModal?: () => void;
}

export function PromptComposer({
  promptInput,
  setPromptInput,
  onSend,
  personaId,
  personaName,
  currentCost,
  canAfford,
  currentEnergy,
  promptEnergyCost: promptEnergyCostProp,
  isStreaming,
  isInferenceOnline,
  cooldownSeconds,
  onOpenWarningModal,
}: PromptComposerProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isPalantint = personaId === 'palantint';
  const promptCharCount = promptInput.length;

  const baseEnergyCost = isPalantint
    ? 100
    : personaId === 'cyberarchitect'
    ? 15
    : personaId === 'boursebot'
    ? 10
    : 5;

  const promptEnergyCost =
    promptEnergyCostProp ??
    (isPalantint
      ? 100
      : Math.min(
          100,
          baseEnergyCost + Math.max(0, Math.floor((Math.max(1, promptCharCount) - 1) / 1000)) * 5
        ));

  const hasEnoughEnergy = currentEnergy >= promptEnergyCost;
  const theme = getPersonaTheme(personaId);

  // Focus input on mount or when persona changes
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, [personaId]);

  // Reset textarea height when prompt is sent/cleared
  useEffect(() => {
    if (!promptInput && inputRef.current) {
      inputRef.current.style.height = '42px';
    }
  }, [promptInput]);

  return (
    <footer className="p-3 sm:p-4 border-t border-white/10 bg-black/90 flex-shrink-0">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        className="max-w-4xl mx-auto w-full"
      >
        <div
          className={`p-3 rounded-2xl border transition-all duration-200 bg-white/[0.03] backdrop-blur-md shadow-2xl flex flex-col gap-2.5 ${theme.composerRing}`}
        >
          {/* Textarea Area */}
          <textarea
            ref={inputRef}
            value={promptInput}
            onChange={(e) => {
              setPromptInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(160, Math.max(42, e.target.scrollHeight))}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            disabled={isStreaming || !canAfford || !isInferenceOnline}
            rows={1}
            maxLength={4000}
            placeholder={
              !isInferenceOnline
                ? "Serveur d'inférence déconnecté..."
                : !canAfford
                ? `Réserves de potassium requises (${formatNumber(currentCost)} Bananes)...`
                : isPalantint
                ? "Parle au vide..."
                : `Transmettre une consigne à ${personaName || "l'IA"} (Shift+Entrée pour retour)...`
            }
            className="w-full bg-transparent text-xs sm:text-sm font-sans text-white/95 placeholder-white/30 focus:outline-none resize-none leading-relaxed custom-scrollbar disabled:opacity-40"
            style={{ minHeight: '42px' }}
          />

          {/* Composer Bottom Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs font-mono">
            {/* Left Side: Length Counter & Security Reminder Link */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span
                className={`text-[10px] font-mono ${
                  promptCharCount > 3500
                    ? 'text-red-400 font-bold'
                    : promptCharCount > 2000
                    ? 'text-amber-400'
                    : 'text-white/40'
                }`}
              >
                {promptCharCount} / 4000
              </span>

              {onOpenWarningModal ? (
                <button
                  type="button"
                  onClick={onOpenWarningModal}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-red-500/30 hover:border-red-500/60 bg-red-950/30 hover:bg-red-900/40 text-red-400 hover:text-red-300 text-[10px] font-mono transition-all cursor-pointer shadow-sm active:scale-95 group"
                  title="Consulter l'avertissement de non-confidentialité (ne jamais saisir de mots de passe, tokens ou données privées)"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform flex-shrink-0" />
                  <span className="hidden sm:inline font-semibold">Ne saisissez aucun secret</span>
                  <span className="font-bold underline underline-offset-2">Sécurité & PII</span>
                </button>
              ) : (
                <span className="text-[10px] text-white/35 font-mono hidden md:inline">
                  Entrée pour envoyer • Maj + Entrée pour saut
                </span>
              )}
            </div>

            {/* Right Side: Banana Prompt Price + Energy Cost + Send Prompt Button */}
            <div className="flex items-center gap-2 sm:gap-2.5 ml-auto flex-wrap">
              {/* Banana Prompt Price Badge */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors ${
                  canAfford
                    ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-300'
                    : 'bg-red-500/15 border-red-500/40 text-red-400'
                }`}
                title={`Tarif du prompt : ${formatNumber(currentCost)} Bananes`}
              >
                <Banana className="w-3 h-3 text-banan-primary flex-shrink-0" />
                <span>{formatNumber(currentCost)}</span>
              </div>

              {/* Dynamic Energy Cost Badge */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors ${
                  !hasEnoughEnergy
                    ? 'bg-red-500/15 border-red-500/40 text-red-300'
                    : isPalantint
                    ? 'bg-red-950/40 border-red-900/40 text-red-300 font-mono'
                    : promptEnergyCost > baseEnergyCost
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-white/5 border-white/10 text-white/70'
                }`}
                title={`Coût énergétique : ${promptEnergyCost}% (Recharge en cours (8.3% par heure))`}
              >
                <Zap className="w-3 h-3 text-banan-primary flex-shrink-0" />
                <span>{promptEnergyCost}%</span>
                <span className="hidden sm:inline">Énergie</span>
                {promptCharCount > 1000 && !isPalantint && promptEnergyCost > baseEnergyCost && (
                  <span className="text-[9px] opacity-75 hidden sm:inline">
                    (+{promptEnergyCost - baseEnergyCost}%)
                  </span>
                )}
              </div>

              {/* Send Prompt Button */}
              <button
                type="submit"
                disabled={
                  isStreaming ||
                  !promptInput.trim() ||
                  !canAfford ||
                  !hasEnoughEnergy ||
                  !isInferenceOnline ||
                  cooldownSeconds > 0
                }
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold flex items-center gap-2 transition-all text-xs font-mono disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-lg active:scale-95 ${theme.sendButtonClass}`}
                title={
                  isPalantint
                    ? `Send prompt (${formatNumber(currentCost)} Bananes, 100% Énergie)`
                    : `Send prompt (${formatNumber(currentCost)} Bananes, ${promptEnergyCost}% Énergie)`
                }
              >
                <Send className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-bold whitespace-nowrap">
                  Send prompt
                </span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </footer>
  );
}
