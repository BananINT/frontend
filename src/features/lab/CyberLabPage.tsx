import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@app/context/AuthContext';
import { useGame } from '@app/context/GameContext';
import { api } from '@app/lib/api';
import keycloak from '@app/lib/keycloak';
import { formatNumber } from '@app/utils/format';
import type {
  ChatSession,
  ChatMessage,
  PersonaInfo,
  RateLimitStatus,
  HtmlAppPreview,
  ToolCallDetail,
} from './types';
import { SandboxPreviewDrawer } from './components/SandboxPreviewDrawer';
import { CyberLabSidebar } from './components/CyberLabSidebar';
import { CyberLabHeader } from './components/CyberLabHeader';
import { PromptComposer } from './components/PromptComposer';
import { EmptyStateSuggestions } from './components/EmptyStateSuggestions';
import { ChatMessageItem } from './components/ChatMessageItem';
import { StreamingMessageCard } from './components/StreamingMessageCard';
import { LabStatusBar } from './components/LabStatusBar';
import { getPersonaTheme } from './components/personaTheme';
import { CyberLabWarningModal, CYBERLAB_PRIVACY_KEY } from './components/CyberLabWarningModal';
import { PERSONA_PRESETS } from './personaPresets';
import { INITIAL_RATE_LIMITS, useLabRateLimitTicks } from './hooks/useLabRateLimits';
import { takeSseEvents } from './lib/sseEvents';

export default function CyberLabPage() {
  const { authenticated } = useAuth();
  const { gameState } = useGame();

  const [personas, setPersonas] = useState<PersonaInfo[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('bananabot');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const [promptInput, setPromptInput] = useState('');
  const [streamingSessionId, setStreamingSessionId] = useState<string | null>(null);
  const [streamedText, setStreamedText] = useState('');
  const [liveToolCalls, setLiveToolCalls] = useState<ToolCallDetail[]>([]);

  const isStreaming = !!streamingSessionId;
  const isStreamingActiveSession = !!streamingSessionId && (streamingSessionId === activeSessionId || (streamingSessionId === 'pending' && !activeSessionId));

  // Split View Preview State
  const [previewApp, setPreviewApp] = useState<HtmlAppPreview | null>(null);

  const [promptCost, setPromptCost] = useState<number>(10_000_000);
  const [palantintCost, setPalantintCost] = useState<number>(250_000_000);
  const [rateLimits, setRateLimits] = useState<RateLimitStatus>(INITIAL_RATE_LIMITS);
  const [isInferenceOnline, setIsInferenceOnline] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-open Gigantic Warning on first entry if not previously acknowledged
  const [isWarningModalOpen, setIsWarningModalOpen] = useState<boolean>(() => {
    return localStorage.getItem(CYBERLAB_PRIVACY_KEY) !== 'true';
  });

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const activePersona = personas.find((p) => p.id === selectedPersonaId) || personas[0];
  const isPalantint = selectedPersonaId === 'palantint';
  const theme = getPersonaTheme(selectedPersonaId);

  // Cost calculation
  const currentCost = isPalantint
    ? (activePersona?.prompt_cost ?? palantintCost)
    : (activePersona?.prompt_cost ?? promptCost);

  const userBananas = gameState?.bananas ?? 0;
  const canAfford = userBananas >= currentCost;

  // Dynamic prompt energy calculation based on length and persona
  const getPromptEnergyCost = useCallback((text: string, personaId: string) => {
    const pid = personaId.toLowerCase();
    if (pid === 'palantint') return 100;
    const base = pid === 'cyberarchitect' ? 15 : pid === 'boursebot' ? 10 : 5;
    const len = text.length;
    const extraChunks = Math.max(0, Math.floor((Math.max(1, len) - 1) / 1000));
    return Math.min(100, base + extraChunks * 5);
  }, []);

  const currentEnergy = rateLimits.energy?.current ?? 100;
  const promptEnergyCost = getPromptEnergyCost(promptInput, selectedPersonaId);
  const hasEnoughEnergy = currentEnergy >= promptEnergyCost;

  // Scroll messages container smoothly without moving the window
  const scrollToContainerBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
    }
  }, []);

  useLabRateLimitTicks(rateLimits.cooldown_remaining_seconds, setRateLimits);

  const refreshConfig = async () => {
    try {
      const res = await api.get('/ai/config');
      setPersonas(res.data.personas || []);
      setPromptCost(res.data.prompt_cost || 10_000_000);
      if (res.data.palantint_cost) {
        setPalantintCost(res.data.palantint_cost);
      }
      setIsInferenceOnline(res.data.inference_configured ?? false);
      if (res.data.limits) {
        setRateLimits(res.data.limits);
      }
    } catch (err) {
      console.error('Failed to load CyberLab config', err);
    }
  };

  const refreshSessions = async () => {
    try {
      const res = await api.get('/ai/sessions');
      setSessions(res.data || []);
    } catch (err) {
      console.error('Failed to load chat sessions', err);
    }
  };

  // Initial load
  useEffect(() => {
    if (!authenticated) return;
    let isCancelled = false;

    const fetchInitialData = async () => {
      try {
        const [cfgRes, sessRes] = await Promise.all([
          api.get('/ai/config'),
          api.get('/ai/sessions'),
        ]);
        if (isCancelled) return;
        setPersonas(cfgRes.data.personas || []);
        setPromptCost(cfgRes.data.prompt_cost || 10_000_000);
        if (cfgRes.data.palantint_cost) {
          setPalantintCost(cfgRes.data.palantint_cost);
        }
        setIsInferenceOnline(cfgRes.data.inference_configured ?? false);
        if (cfgRes.data.limits) {
          setRateLimits(cfgRes.data.limits);
        }
        const sessList = sessRes.data || [];
        setSessions(sessList);
      } catch (err) {
        console.error('Failed to load CyberLab initial data', err);
      }
    };

    fetchInitialData();
    return () => {
      isCancelled = true;
    };
  }, [authenticated]);

  // Launch Split View HTML Sandbox
  const handleOpenPreview = useCallback((htmlCode: string, title?: string) => {
    setPreviewApp({
      htmlCode,
      title: title || 'Jeu HTML5 Sandbox',
      viewportMode: 'desktop',
    });
  }, []);

  const processSseStream = useCallback(
    async (response: Response, initialSessionId: string) => {
      if (!response.body) {
        throw new Error('Flux de réponse non disponible.');
      }

      let targetSessionId = initialSessionId;
      if (targetSessionId) {
        setStreamingSessionId(targetSessionId);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedResponse = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const { events, rest } = takeSseEvents(buffer);
        buffer = rest;

        for (const { event: eventType, data: dataStr } of events) {
          try {
            const parsed = JSON.parse(dataStr);

            if (eventType === 'meta') {
              if (parsed.session_id) {
                targetSessionId = parsed.session_id;
                setStreamingSessionId(parsed.session_id);
                setActiveSessionId((curr) => curr ?? parsed.session_id);
                refreshSessions();
              }
              if (parsed.limits) {
                setRateLimits(parsed.limits);
              }
            } else if (eventType === 'chunk') {
              accumulatedResponse += parsed.text;
              setStreamedText(accumulatedResponse);
            } else if (eventType === 'tool_start') {
              setLiveToolCalls((prev) => [
                ...prev,
                { name: parsed.name, arguments: parsed.arguments, status: 'running' },
              ]);
            } else if (eventType === 'tool_result') {
              setLiveToolCalls((prev) =>
                prev.map((t) =>
                  t.name === parsed.name && t.status === 'running'
                    ? { ...t, result: parsed.result, status: 'completed' }
                    : t
                )
              );
            } else if (eventType === 'done') {
              if (parsed.full_text) {
                accumulatedResponse = parsed.full_text;
              }
              const assistantMsg: ChatMessage = {
                role: 'assistant',
                content: accumulatedResponse,
                tool_calls: parsed.tool_details || (liveToolCalls.length > 0 ? liveToolCalls : parsed.tools_used),
                created_at: new Date().toISOString(),
              };

              setActiveSessionId((curr) => {
                if (curr === targetSessionId) {
                  setMessages((prev) => [...prev, assistantMsg]);
                }
                return curr;
              });

              setStreamingSessionId(null);
              setStreamedText('');
              setLiveToolCalls([]);
              refreshSessions();

              // Auto-detect HTML app if generated by cyberarchitect
              if (selectedPersonaId === 'cyberarchitect' && accumulatedResponse.includes('```html')) {
                const codeMatch = /```html\s*([\s\S]*?)```/i.exec(accumulatedResponse);
                if (codeMatch && codeMatch[1]) {
                  const code = codeMatch[1];
                  const titleMatch = /<title>(.*?)<\/title>/i.exec(code);
                  handleOpenPreview(code, titleMatch ? titleMatch[1] : 'GameForge Sandbox');
                }
              }
            } else if (eventType === 'error') {
              if (parsed.limits) {
                setRateLimits(parsed.limits);
              }
              if (parsed.refunded) {
                setErrorMessage(`${parsed.error || 'Erreur d\'inférence.'} (Énergie et Bananes remboursées)`);
              } else {
                setErrorMessage(parsed.error || 'Erreur lors du traitement.');
              }
              setStreamingSessionId(null);
              setStreamedText('');
              setLiveToolCalls([]);
              refreshConfig();
            }
          } catch {
            // Ignore parse errors on partial chunks
          }
        }
      }
    },
    [selectedPersonaId, liveToolCalls, handleOpenPreview]
  );

  // Load active session messages if activeSessionId is set
  useEffect(() => {
    if (!activeSessionId) return;
    let isCancelled = false;

    const fetchSessionMessages = async () => {
      try {
        const res = await api.get(`/ai/sessions/${activeSessionId}`);
        if (isCancelled) return;
        setMessages(res.data.messages || []);
        if (res.data.session?.persona_id) {
          setSelectedPersonaId(res.data.session.persona_id);
        }

        // Reconnect to in-flight server generation if active
        if (res.data.is_generating && streamingSessionId !== activeSessionId) {
          setStreamingSessionId(activeSessionId);
          setStreamedText(res.data.active_text || '');
          setLiveToolCalls(res.data.active_tools || []);

          fetch(`/api/ai/sessions/${activeSessionId}/stream`, {
            headers: { Authorization: `Bearer ${keycloak.token}` },
          })
            .then((streamRes) => {
              if (streamRes.ok) {
                processSseStream(streamRes, activeSessionId);
              }
            })
            .catch((e) => console.error('Failed to attach to active session stream', e));
        }
      } catch (err) {
        console.error('Failed to load session messages', err);
      }
    };

    fetchSessionMessages();
    return () => {
      isCancelled = true;
    };
  }, [activeSessionId, streamingSessionId, processSseStream]);

  // Selecting a persona - does NOT create a session until a prompt is sent!
  const handleSelectPersona = (personaId: string) => {
    setSelectedPersonaId(personaId);
    setActiveSessionId(null);
    setMessages([]);
    setErrorMessage(null);
    setIsMobileDrawerOpen(false);
  };

  // Resetting draft state without database persistence
  const handleResetDraft = () => {
    setActiveSessionId(null);
    setMessages([]);
    setErrorMessage(null);
    setIsMobileDrawerOpen(false);
  };

  // Selecting an existing session
  const handleSelectSession = (sess: ChatSession) => {
    setActiveSessionId(sess.id);
    setSelectedPersonaId(sess.persona_id);
    setErrorMessage(null);
    setIsMobileDrawerOpen(false);
  };

  // Delete session
  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/ai/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete session', err);
    }
  };

  // Submit Prompt via SSE Stream
  const handleSendPrompt = async (overridePrompt?: string) => {
    const promptToSend = (overridePrompt ?? promptInput).trim();
    if (!promptToSend || isStreaming) return;

    if (!isInferenceOnline) {
      setErrorMessage("SERVEUR D'INFÉRENCE HORS LIGNE : L'infrastructure IA n'est pas connectée.");
      return;
    }

    if (!canAfford) {
      setErrorMessage(`RÉSERVES INSUFFISANTES : ${formatNumber(currentCost)} Bananes requises (votre solde : ${formatNumber(userBananas)}).`);
      return;
    }

    const requiredEnergy = getPromptEnergyCost(promptToSend, selectedPersonaId);
    if (currentEnergy < requiredEnergy) {
      setErrorMessage(
        `ÉNERGIE INSUFFISANTE : Requiert ${requiredEnergy}% d'énergie (${Math.floor(currentEnergy)}% disponible). Recharge en cours (8.3% par heure).`
      );
      return;
    }

    if (rateLimits.cooldown_remaining_seconds > 0) {
      setErrorMessage(`SURCHAUFFE : Attendez ${rateLimits.cooldown_remaining_seconds.toFixed(1)}s avant le prochain signal.`);
      return;
    }

    setErrorMessage(null);
    setPromptInput('');

    // Mark current session as streaming
    const currentSessionId = activeSessionId || 'pending';
    setStreamingSessionId(currentSessionId);
    setStreamedText('');
    setLiveToolCalls([]);

    // Optimistically append user message
    const tempUserMsg: ChatMessage = {
      role: 'user',
      content: promptToSend,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    // Scroll to new user message
    setTimeout(() => scrollToContainerBottom('smooth'), 50);

    try {
      const response = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify({
          content: promptToSend,
          session_id: activeSessionId,
          persona_id: selectedPersonaId,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ detail: 'Erreur réseau inconnue.' }));
        throw new Error(errJson.detail || `Erreur HTTP ${response.status}`);
      }

      await processSseStream(response, activeSessionId || '');
      refreshConfig();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setErrorMessage(msg);
      setStreamingSessionId(null);
      setStreamedText('');
      setLiveToolCalls([]);
      refreshConfig();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-3rem)] h-[calc(100dvh-3rem)] bg-black text-white font-mono overflow-hidden relative">
      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR: SESSIONS, PERSONAS & ENERGY (>= lg)                      */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex w-80 flex-shrink-0 border-r border-white/10 bg-black/90 flex-col justify-between overflow-hidden">
        <CyberLabSidebar
          personas={personas}
          selectedPersonaId={selectedPersonaId}
          onSelectPersona={handleSelectPersona}
          sessions={sessions}
          activeSessionId={activeSessionId}
          streamingSessionId={streamingSessionId}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onNewSession={handleResetDraft}
          rateLimits={rateLimits}
          currentEnergy={currentEnergy}
        />
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE SLIDE-OVER DRAWER (< lg)                                           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="lg:hidden fixed top-12 bottom-0 inset-x-0 bg-black/75 z-30"
            />

            {/* Slide-in drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden fixed top-12 bottom-0 left-0 w-80 max-w-[85vw] border-r border-white/15 z-40 flex flex-col justify-between shadow-2xl overflow-hidden transform-gpu will-change-transform bg-black"
            >
              <CyberLabSidebar
                personas={personas}
                selectedPersonaId={selectedPersonaId}
                onSelectPersona={handleSelectPersona}
                sessions={sessions}
                activeSessionId={activeSessionId}
                streamingSessionId={streamingSessionId}
                onSelectSession={handleSelectSession}
                onDeleteSession={handleDeleteSession}
                onNewSession={handleResetDraft}
                rateLimits={rateLimits}
                currentEnergy={currentEnergy}
                onCloseMobile={() => setIsMobileDrawerOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MAIN TERMINAL CONSOLE                                                     */}
      {/* ========================================================================= */}
      <section className="flex-1 flex flex-col bg-black overflow-hidden relative transition-all duration-300 w-full min-w-0">
        {/* Terminal Header with Dynamic Colors & Zero Clutter */}
        <CyberLabHeader
          activePersona={activePersona}
          personaId={selectedPersonaId}
          onToggleMobileDrawer={() => setIsMobileDrawerOpen((prev) => !prev)}
        />

        {/* Message Stream Container */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 custom-scrollbar select-text"
        >
          {messages.length === 0 && !isStreamingActiveSession && (
            <EmptyStateSuggestions
              persona={activePersona}
              personaId={selectedPersonaId}
              canAfford={canAfford}
              currentEnergy={currentEnergy}
              isStreaming={isStreaming}
              getPromptEnergyCost={getPromptEnergyCost}
              onSelectPreset={(preset) => handleSendPrompt(preset)}
              presets={activePersona?.presets && activePersona.presets.length > 0 ? activePersona.presets : (PERSONA_PRESETS[selectedPersonaId] || [])}
            />
          )}

          {/* Render Messages */}
          {messages.map((msg, index) => (
            <ChatMessageItem
              key={msg.id ?? `${msg.role}-${index}-${msg.created_at || ''}`}
              message={msg}
              personaName={activePersona?.name}
              personaId={selectedPersonaId}
              onPreview={handleOpenPreview}
            />
          ))}

          {/* Real-time Streaming Message (Cyber-Ops Smooth Stream - strictly scoped to this session) */}
          {isStreamingActiveSession && (
            <StreamingMessageCard
              isPalantint={isPalantint}
              theme={theme}
              activePersona={activePersona}
              selectedPersonaId={selectedPersonaId}
              liveToolCalls={liveToolCalls}
              streamedText={streamedText}
              onPreview={handleOpenPreview}
            />
          )}
        </div>

        {/* Insufficient Balance / Error Warning Bar */}
        <LabStatusBar
          canAfford={canAfford}
          hasEnoughEnergy={hasEnoughEnergy}
          isInferenceOnline={isInferenceOnline}
          errorMessage={errorMessage}
          onDismissError={() => setErrorMessage(null)}
          userBananas={userBananas}
          currentCost={currentCost}
          currentEnergy={currentEnergy}
          promptEnergyCost={promptEnergyCost}
        />

        {/* Modular Prompt Input Composer */}
        <PromptComposer
          promptInput={promptInput}
          setPromptInput={setPromptInput}
          onSend={() => handleSendPrompt()}
          personaId={selectedPersonaId}
          personaName={activePersona?.name}
          currentCost={currentCost}
          canAfford={canAfford}
          currentEnergy={currentEnergy}
          promptEnergyCost={promptEnergyCost}
          isStreaming={isStreaming}
          isInferenceOnline={isInferenceOnline}
          cooldownSeconds={rateLimits.cooldown_remaining_seconds}
          onOpenWarningModal={() => setIsWarningModalOpen(true)}
        />
      </section>

      {/* ========================================================================= */}
      {/* RIGHT DRAWER: SPLIT VIEW SANDBOX PREVIEW                                  */}
      {/* ========================================================================= */}
      <SandboxPreviewDrawer
        previewApp={previewApp}
        onClose={() => setPreviewApp(null)}
      />

      {/* ========================================================================= */}
      {/* GIGANTIC PRIVACY & SECURITY WARNING MODAL                                */}
      {/* ========================================================================= */}
      <CyberLabWarningModal
        isOpen={isWarningModalOpen}
        onClose={() => setIsWarningModalOpen(false)}
      />
    </div>
  );
}
