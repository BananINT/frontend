import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { User, Copy, Check } from 'lucide-react';
import { useAuth } from '@app/context/AuthContext';
import type { ChatMessage } from '../types';
import { MarkdownMessage } from './MarkdownMessage';
import { PersonaIcon } from './PersonaIcon';
import { ToolCallInspector } from './ToolCallInspector';
import { getPersonaTheme } from './personaTheme';

interface ChatMessageItemProps {
  message: ChatMessage;
  personaName?: string;
  personaId?: string;
  onPreview: (htmlCode: string, title?: string) => void;
}

export const ChatMessageItem = memo(function ChatMessageItem({
  message,
  personaName,
  personaId = 'bananabot',
  onPreview,
}: ChatMessageItemProps) {
  const { username } = useAuth();
  const displayName = username || 'Bananier';
  const isUser = message.role === 'user';
  const isPalantint = personaId === 'palantint' || personaName?.toLowerCase() === 'palantint';
  const theme = getPersonaTheme(personaId);

  const [copied, setCopied] = useState(false);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard error
    }
  };

  const wordCount = message.content.trim().split(/\s+/).filter(Boolean).length;

  // ---------------------------------------------------------------------------
  // USER MESSAGE CARD (Clean Cyber-Ops Right-Aligned Glass)
  // ---------------------------------------------------------------------------
  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-end ml-auto max-w-2xl w-full group"
      >
        <div className="p-4 rounded-2xl border border-banan-primary/30 bg-gradient-to-br from-banan-primary/10 via-black/80 to-black/90 backdrop-blur-md text-white shadow-xl max-w-full break-words select-text">
          {/* User Author Header */}
          <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-banan-primary/20 text-[11px] font-mono text-white/50 uppercase tracking-widest">
            <div className="flex items-center gap-1.5 text-banan-primary font-bold">
              <User className="w-3.5 h-3.5" />
              <span>{displayName} (Vous)</span>
            </div>
            {message.created_at && (
              <span>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            )}
          </div>

          {/* User Prompt Text */}
          <div className="text-xs sm:text-sm font-sans leading-relaxed text-white/95 whitespace-pre-wrap select-text">
            {message.content}
          </div>
        </div>
      </motion.div>
    );
  }

  // ---------------------------------------------------------------------------
  // ASSISTANT MESSAGE CARD (Sleek Cyber-Ops Left-Aligned with Avatar & Tools)
  // ---------------------------------------------------------------------------
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 mr-auto max-w-3xl w-full group"
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
          name={isPalantint ? 'EyeOff' : personaId}
          className="w-4 h-4 sm:w-5 sm:h-5"
        />
      </div>

      {/* Message Body Card */}
      <div
        className={`flex-1 p-4 rounded-2xl border backdrop-blur-md transition-all duration-200 shadow-xl overflow-hidden select-text ${
          isPalantint
            ? 'border-white/[0.08] bg-black/90 text-white/90 shadow-2xl'
            : 'border-white/10 hover:border-white/20 bg-white/[0.025] text-white/90'
        }`}
      >
        {/* Author Header & Actions Bar */}
        <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-white/10 text-[11px] font-mono text-white/60">
          <div className="flex items-center gap-2">
            <span
              className={`font-black uppercase tracking-wider text-xs ${
                isPalantint ? 'font-mono text-white/40 tracking-[0.25em]' : 'text-white'
              }`}
            >
              {isPalantint ? 'p̷a̸l̶a̸n̷t̶i̸n̷t̶' : personaName || 'IA'}
            </span>

            {!isPalantint && (
              <span className={`px-1.5 py-0.5 rounded border font-mono font-bold text-[11px] ${theme.badgeClass}`}>
                {theme.roleBadge}
              </span>
            )}

            {message.created_at && (
              <span className="text-white/60 hidden sm:inline">
                • {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          {/* Hover Actions: Word Count & Copy Message */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/60 hidden md:inline">
              {wordCount} mots
            </span>

            <button
              type="button"
              onClick={handleCopyMessage}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-white/[0.04] hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
              title="Copier la réponse complète"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copié</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Cyber Inspector: Tool Calls (if any) */}
        {message.tool_calls && message.tool_calls.length > 0 && (
          <ToolCallInspector toolCalls={message.tool_calls} />
        )}

        {/* Markdown Content */}
        <MarkdownMessage content={message.content} onPreview={onPreview} />
      </div>
    </motion.div>
  );
});
