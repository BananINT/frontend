import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import type { PersonaInfo } from '../types';
import { PersonaIcon } from './PersonaIcon';
import { getPersonaTheme } from './personaTheme';

interface CyberLabHeaderProps {
  activePersona: PersonaInfo | undefined;
  personaId: string;
  onToggleMobileDrawer?: () => void;
}

const PALANTINT_GLITCHES = [
  'p̷a̸l̶a̸n̷t̶i̸n̷t̶',
  'p_l_nt_nt',
  'palantint',
  '[ · · · ]',
  'p̷a̸l̶a̸n̷t̶i̸n̷t̶',
  '0x??_VOID',
  'p̸a̷l̶a̸n̷t̶i̸n̷t̶',
];

export function CyberLabHeader({
  activePersona,
  personaId,
  onToggleMobileDrawer,
}: CyberLabHeaderProps) {
  const isPalantint = personaId === 'palantint';
  const theme = getPersonaTheme(personaId);

  const [glitchIndex, setGlitchIndex] = useState(0);

  // Subtle mysterious glitch flicker for PalantINT
  useEffect(() => {
    if (!isPalantint) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.35) {
        setGlitchIndex((prev) => (prev + 1) % PALANTINT_GLITCHES.length);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [isPalantint]);

  // PalantINT: Almost blank, super mysterious, buggy/glitched minimalist void
  if (isPalantint) {
    return (
      <header className="h-14 px-3 sm:px-6 border-b border-white/[0.04] bg-black/95 flex items-center justify-between z-10 flex-shrink-0 min-w-0 select-none">
        <div className="flex items-center gap-3 min-w-0">
          {onToggleMobileDrawer && (
            <button
              type="button"
              onClick={onToggleMobileDrawer}
              className="lg:hidden p-1.5 -ml-1 text-red-500/70 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
              title="Menu des sessions"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF0055]/50 animate-ping flex-shrink-0" />
          <span className="font-mono text-xs tracking-[0.35em] text-white/30 uppercase select-none hover:text-white/60 transition-colors">
            {PALANTINT_GLITCHES[glitchIndex]}
          </span>
          <span className="text-[10px] font-mono text-white/15 animate-pulse">
            _
          </span>
        </div>
      </header>
    );
  }

  // Standard personas: clean themed header with privacy warning button on the right
  return (
    <header
      className={`h-14 px-3 sm:px-6 border-b flex items-center justify-between z-10 flex-shrink-0 gap-3 min-w-0 transition-all duration-300 backdrop-blur-md ${theme.headerBorder} ${theme.headerBg}`}
    >
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
        {onToggleMobileDrawer && (
          <button
            type="button"
            onClick={onToggleMobileDrawer}
            className="lg:hidden p-1.5 -ml-1 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex-shrink-0"
            title="Menu des sessions"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Persona Icon with Dynamic Theme Color */}
        <div
          className={`p-1.5 sm:p-2 rounded-lg border flex-shrink-0 transition-all ${theme.headerBorder} ${theme.cardBgSelected} ${theme.headerText} ${theme.headerGlow}`}
        >
          <PersonaIcon
            name={activePersona?.icon || activePersona?.avatar}
            className="w-4 h-4 sm:w-5 sm:h-5"
          />
        </div>

        {/* Persona Name, Role Badge, and Tagline */}
        <div className="min-w-0 truncate">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-xs sm:text-sm font-black uppercase tracking-wide text-white truncate">
              {activePersona?.name || 'Bananabot'}
            </h1>

            {/* Thematic Role Badge matching persona card colors */}
            <span
              className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded border font-mono font-bold flex-shrink-0 transition-colors ${theme.badgeClass}`}
            >
              {theme.roleBadge}
            </span>
          </div>

          <p className="text-[10px] text-white/50 truncate max-w-xs xl:max-w-md hidden xl:block mt-0.5">
            {activePersona?.tagline}
          </p>
        </div>
      </div>
    </header>
  );
}
