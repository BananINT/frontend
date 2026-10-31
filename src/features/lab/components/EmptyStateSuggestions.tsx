import { Send, Radio } from 'lucide-react';
import type { PersonaInfo } from '../types';
import { PersonaIcon } from './PersonaIcon';
import { getPersonaTheme } from './personaTheme';

interface EmptyStateSuggestionsProps {
  persona: PersonaInfo | undefined;
  personaId: string;
  canAfford: boolean;
  currentEnergy: number;
  isStreaming: boolean;
  getPromptEnergyCost: (text: string, personaId: string) => number;
  onSelectPreset: (preset: string) => void;
  presets: string[];
}

export function EmptyStateSuggestions({
  persona,
  personaId,
  canAfford,
  currentEnergy,
  isStreaming,
  getPromptEnergyCost,
  onSelectPreset,
  presets,
}: EmptyStateSuggestionsProps) {
  const isPalantint = personaId === 'palantint';
  const theme = getPersonaTheme(personaId);

  // PalantINT: Minimalist, mysterious, dark & succinct
  if (isPalantint) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center select-none py-12">
        <span className="font-mono text-xs sm:text-sm tracking-[0.45em] text-white/60 uppercase">
          p̷a̸l̶a̸n̷t̶i̸n̷t̶
        </span>
      </div>
    );
  }

  // Standard personas: regular protocol suggestions
  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto text-center gap-4 py-8">
      {/* Persona Central Icon with Thematic Glow */}
      <div
        className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-3xl shadow-lg transition-all ${theme.headerBorder} ${theme.headerBg} ${theme.headerText} ${theme.headerGlow}`}
      >
        <PersonaIcon name={persona?.icon || persona?.avatar} className="w-8 h-8" />
      </div>

      <div>
        <h2 className="text-base font-black uppercase text-white tracking-wide">
          Canal Ouvert avec {persona?.name || 'IA'}
        </h2>
        <p className="text-xs text-white/50 mt-1 max-w-md">
          Posez une question ou sélectionnez une amorce ci-dessous pour lancer l&apos;inférence neuronale.
        </p>
      </div>

      {/* Quick Prompt Presets */}
      <div className="flex flex-col gap-2 w-full mt-2">
        <span className="text-[11px] uppercase tracking-widest text-white/60 font-bold text-left flex items-center gap-1.5">
          <Radio className={`w-3 h-3 ${theme.headerText}`} />
          <span>Suggestions de Protocoles</span>
        </span>
        <div className="grid grid-cols-1 gap-2">
          {presets.map((preset, idx) => {
            const cost = getPromptEnergyCost(preset, personaId);
            const disabled = isStreaming || !canAfford || currentEnergy < cost;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPreset(preset)}
                disabled={disabled}
                className="px-3 py-2 rounded border border-white/10 bg-white/[0.03] hover:border-banan-primary/50 hover:bg-banan-primary/10 text-white/80 hover:text-white text-xs text-left transition-all flex items-center justify-between group disabled:opacity-40 cursor-pointer"
              >
                <span className="truncate">{preset}</span>
                <Send
                  className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${theme.headerText}`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
