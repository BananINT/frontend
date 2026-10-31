import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import type { PersonaInfo, ToolCallDetail } from '../types';
import { MarkdownMessage } from './MarkdownMessage';
import { ToolCallInspector } from './ToolCallInspector';
import { PersonaIcon } from './PersonaIcon';
import type { getPersonaTheme } from './personaTheme';

interface StreamingMessageCardProps {
  isPalantint: boolean;
  theme: ReturnType<typeof getPersonaTheme>;
  activePersona: PersonaInfo | undefined;
  selectedPersonaId: string;
  liveToolCalls: ToolCallDetail[];
  streamedText: string;
  onPreview: (htmlCode: string, title?: string) => void;
}

/** Real-time Streaming Message (Cyber-Ops Smooth Stream - strictly scoped to this session). */
export function StreamingMessageCard({
  isPalantint, theme, activePersona, selectedPersonaId, liveToolCalls, streamedText, onPreview,
}: StreamingMessageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 mr-auto max-w-3xl w-full"
    >
      {/* Persona Avatar on Left */}
      <div
        className={`p-2 rounded-xl border flex-shrink-0 transition-all mt-0.5 ${
          isPalantint
            ? 'border-white/[0.08] bg-black/90 text-white/40'
            : `${theme.headerBorder} ${theme.cardBgSelected} ${theme.headerText} ${theme.headerGlow}`
        }`}
      >
        <PersonaIcon
          name={isPalantint ? 'EyeOff' : activePersona?.icon || activePersona?.avatar || selectedPersonaId}
          className="w-4 h-4 sm:w-5 sm:h-5"
        />
      </div>

      {/* Streaming Content Card */}
      <div
        className={`flex-1 p-4 rounded-2xl border backdrop-blur-md transition-all shadow-xl overflow-hidden select-text ${
          isPalantint
            ? 'border-white/[0.08] bg-black/90 text-white/90 shadow-2xl'
            : `${theme.headerBorder} bg-white/[0.025] text-white/90 ${theme.headerGlow}`
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-white/10 text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`font-black uppercase tracking-wider text-xs ${
                isPalantint ? 'font-mono text-white/40 tracking-[0.25em]' : 'text-white'
              }`}
            >
              {isPalantint ? 'p̷a̸l̶a̸n̷t̶i̸n̷t̶' : activePersona?.name || 'IA'}
            </span>

            {!isPalantint && (
              <span className={`px-1.5 py-0.5 rounded border font-mono font-bold text-[11px] ${theme.badgeClass}`}>
                {theme.roleBadge}
              </span>
            )}

            <span
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono flex items-center gap-1 ${
                isPalantint
                  ? 'text-red-400/80 bg-red-950/30 border border-red-900/30'
                  : `${theme.headerText} ${theme.headerBg} border ${theme.headerBorder} font-bold`
              }`}
            >
              <Activity className="w-2.5 h-2.5 animate-spin" />
              <span>{isPalantint ? '· · ·' : 'GÉNÉRATION'}</span>
            </span>
          </div>
        </div>

        {/* Live Tool Calls Inspector */}
        {liveToolCalls.length > 0 && (
          <ToolCallInspector toolCalls={liveToolCalls} isLive={true} />
        )}

        {/* Streamed Text */}
        {streamedText ? (
          <MarkdownMessage content={streamedText} onPreview={onPreview} />
        ) : null}
      </div>
    </motion.div>
  );
}
