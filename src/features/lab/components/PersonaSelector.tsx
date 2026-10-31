import type { PersonaInfo } from '../types';
import { PersonaIcon } from './PersonaIcon';
import { getPersonaTheme } from './personaTheme';

interface PersonaSelectorProps {
  personas: PersonaInfo[];
  selectedPersonaId: string;
  onSelectPersona: (id: string) => void;
}

export function PersonaSelector({
  personas,
  selectedPersonaId,
  onSelectPersona,
}: PersonaSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-widest text-white/60 font-bold px-0.5">
        Personas Déployés
      </span>
      <div className="grid grid-cols-2 gap-1.5">
        {personas.map((p) => {
          const isSelected = p.id === selectedPersonaId;
          const theme = getPersonaTheme(p.id);

          return (
            <button
              key={p.id}
              onClick={() => onSelectPersona(p.id)}
              className={`p-2 rounded border text-left flex flex-col transition-all cursor-pointer ${
                isSelected
                  ? `${theme.cardBorderSelected} ${theme.cardBgSelected} ${theme.cardShadowSelected}`
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <PersonaIcon 
                  name={p.icon || p.avatar} 
                  className={`w-4 h-4 ${isSelected ? theme.headerText : 'text-white/70'}`} 
                />
                <span className={`text-[11px] px-1.5 py-0.5 rounded font-mono font-bold border ${theme.badgeClass}`}>
                  {theme.roleBadge}
                </span>
              </div>
              <span
                className={`text-xs font-bold truncate mt-1 ${
                  p.id === 'palantint' ? 'font-mono text-white/70 tracking-wider' : ''
                }`}
              >
                {p.id === 'palantint' ? 'p̷a̸l̶a̸n̷t̶i̸n̷t̶' : p.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
