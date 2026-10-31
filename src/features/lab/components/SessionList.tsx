import { Trash2, Activity } from 'lucide-react';
import type { ChatSession, PersonaInfo } from '../types';
import { PersonaIcon } from './PersonaIcon';

interface SessionListProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  streamingSessionId?: string | null;
  personas: PersonaInfo[];
  onSelectSession: (session: ChatSession) => void;
  onDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
}

export function SessionList({
  sessions,
  activeSessionId,
  streamingSessionId,
  personas,
  onSelectSession,
  onDeleteSession,
}: SessionListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1 custom-scrollbar">
      <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold px-1 mb-1">
        Archives de Sessions
      </span>
      {sessions.length === 0 ? (
        <div className="text-xs text-white/30 p-3 text-center italic">
          Aucune archive enregistrée. Lancez un prompt pour initier une session.
        </div>
      ) : (
        sessions.map((sess) => {
          const isActive = sess.id === activeSessionId;
          const isGenerating = sess.is_generating || sess.id === streamingSessionId;
          const p = personas.find((x) => x.id === sess.persona_id);
          return (
            <div
              key={sess.id}
              role="button"
              tabIndex={0}
              aria-current={isActive ? 'true' : undefined}
              onClick={() => onSelectSession(sess)}
              onKeyDown={(e) => {
                // Ignore keys aimed at the nested delete button.
                if (e.target !== e.currentTarget) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectSession(sess);
                }
              }}
              className={`group px-2.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-banan-primary py-2 rounded text-xs flex items-center justify-between cursor-pointer border transition-colors ${
                isActive
                  ? 'border-banan-primary/50 bg-banan-primary/10 text-white font-bold'
                  : 'border-white/5 hover:border-white/20 text-white/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <PersonaIcon
                  name={p?.icon || p?.avatar}
                  className="w-3.5 h-3.5 text-white/60 flex-shrink-0"
                />
                <span className="truncate">{sess.title}</span>
                {isGenerating && (
                  <span className="flex items-center gap-1 text-[8px] font-mono text-banan-primary bg-banan-primary/15 border border-banan-primary/30 px-1 py-0.5 rounded flex-shrink-0 animate-pulse">
                    <Activity className="w-2 h-2 animate-spin" />
                    <span>EN COURS</span>
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => onDeleteSession(sess.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity cursor-pointer flex-shrink-0"
                title="Supprimer la session"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}
