import { Cpu, Plus, X } from 'lucide-react';
import type { PersonaInfo, ChatSession, RateLimitStatus } from '../types';
import { PersonaSelector } from './PersonaSelector';
import { SessionList } from './SessionList';
import { EnergyStatusCard } from './EnergyStatusCard';

interface CyberLabSidebarProps {
  personas: PersonaInfo[];
  selectedPersonaId: string;
  onSelectPersona: (id: string) => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  streamingSessionId: string | null;
  onSelectSession: (s: ChatSession) => void;
  onDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
  onNewSession: () => void;
  rateLimits: RateLimitStatus;
  currentEnergy: number;
  onCloseMobile?: () => void;
}

export function CyberLabSidebar({
  personas,
  selectedPersonaId,
  onSelectPersona,
  sessions,
  activeSessionId,
  streamingSessionId,
  onSelectSession,
  onDeleteSession,
  onNewSession,
  rateLimits,
  currentEnergy,
  onCloseMobile,
}: CyberLabSidebarProps) {
  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden bg-black/95">
      {/* Drawer Header & Action */}
      <div className="p-3 sm:p-4 border-b border-white/10 flex flex-col gap-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-banan-primary font-black uppercase tracking-wider text-sm truncate">
            <Cpu className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">CyberLab v3.0</span>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* New session button */}
            <button
              type="button"
              onClick={onNewSession}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-banan-primary/40 hover:border-banan-primary bg-banan-primary/10 hover:bg-banan-primary/20 text-banan-primary text-xs font-mono font-bold transition-all cursor-pointer shadow-sm hover:shadow-[0_0_10px_rgba(250,255,0,0.2)] active:scale-95"
              title="Nouvelle session"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New session</span>
            </button>

            {/* Mobile close button */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer lg:hidden"
                title="Fermer le volet"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Persona selector cards */}
        <PersonaSelector
          personas={personas}
          selectedPersonaId={selectedPersonaId}
          onSelectPersona={onSelectPersona}
        />
      </div>

      {/* Sessions List with active generating indicator */}
      <SessionList
        sessions={sessions}
        activeSessionId={activeSessionId}
        streamingSessionId={streamingSessionId}
        personas={personas}
        onSelectSession={onSelectSession}
        onDeleteSession={onDeleteSession}
      />

      {/* Energy Meter & Rate Limits Bar */}
      <EnergyStatusCard
        rateLimits={rateLimits}
        currentEnergy={currentEnergy}
      />
    </div>
  );
}
