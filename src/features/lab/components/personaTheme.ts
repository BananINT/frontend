export interface PersonaTheme {
  id: string;
  roleBadge: string;
  badgeClass: string;
  cardBorderSelected: string;
  cardBgSelected: string;
  cardShadowSelected: string;
  headerBorder: string;
  headerBg: string;
  headerText: string;
  headerGlow: string;
  composerRing: string;
  sendButtonClass: string;
}

export const PERSONA_THEMES: Record<string, PersonaTheme> = {
  bananabot: {
    id: 'bananabot',
    roleBadge: 'AGENT',
    badgeClass: 'text-banan-primary bg-banan-primary/15 border-banan-primary/30',
    cardBorderSelected: 'border-banan-primary',
    cardBgSelected: 'bg-banan-primary/15 text-white',
    cardShadowSelected: 'shadow-[0_0_12px_rgba(250,255,0,0.2)]',
    headerBorder: 'border-banan-primary/40',
    headerBg: 'bg-banan-primary/10',
    headerText: 'text-banan-primary',
    headerGlow: 'shadow-[0_0_15px_rgba(250,255,0,0.15)]',
    composerRing: 'border-white/15 focus-within:border-banan-primary/70 focus-within:shadow-[0_0_20px_rgba(250,255,0,0.12)]',
    sendButtonClass: 'bg-banan-primary text-black hover:bg-yellow-300 shadow-[0_0_15px_rgba(250,255,0,0.3)]',
  },
  cyberarchitect: {
    id: 'cyberarchitect',
    roleBadge: 'ARCADE',
    badgeClass: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    cardBorderSelected: 'border-emerald-400',
    cardBgSelected: 'bg-emerald-500/15 text-white',
    cardShadowSelected: 'shadow-[0_0_12px_rgba(0,255,157,0.25)]',
    headerBorder: 'border-emerald-500/40',
    headerBg: 'bg-emerald-500/10',
    headerText: 'text-emerald-400',
    headerGlow: 'shadow-[0_0_15px_rgba(0,255,157,0.15)]',
    composerRing: 'border-white/15 focus-within:border-emerald-500/70 focus-within:shadow-[0_0_20px_rgba(0,255,157,0.12)]',
    sendButtonClass: 'bg-emerald-400 text-black hover:bg-emerald-300 shadow-[0_0_15px_rgba(0,255,157,0.3)]',
  },
  boursebot: {
    id: 'boursebot',
    roleBadge: 'BNDAQ',
    badgeClass: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
    cardBorderSelected: 'border-cyan-400',
    cardBgSelected: 'bg-cyan-500/15 text-white',
    cardShadowSelected: 'shadow-[0_0_12px_rgba(0,229,255,0.25)]',
    headerBorder: 'border-cyan-500/40',
    headerBg: 'bg-cyan-500/10',
    headerText: 'text-cyan-400',
    headerGlow: 'shadow-[0_0_15px_rgba(0,229,255,0.15)]',
    composerRing: 'border-white/15 focus-within:border-cyan-500/70 focus-within:shadow-[0_0_20px_rgba(0,229,255,0.12)]',
    sendButtonClass: 'bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.3)]',
  },
  palantint: {
    id: 'palantint',
    roleBadge: '···',
    badgeClass: 'text-red-400/60 bg-red-950/30 border-red-900/30 font-mono',
    cardBorderSelected: 'border-red-900/60',
    cardBgSelected: 'bg-red-950/25 text-white/90',
    cardShadowSelected: 'shadow-[0_0_15px_rgba(150,0,30,0.2)]',
    headerBorder: 'border-white/[0.04]',
    headerBg: 'bg-black/95',
    headerText: 'text-red-400/80',
    headerGlow: '',
    composerRing: 'border-white/10 focus-within:border-red-900/60 focus-within:shadow-[0_0_15px_rgba(150,0,30,0.15)]',
    sendButtonClass: 'bg-red-950/80 text-red-200 border border-red-900/60 hover:bg-red-900/90 shadow-[0_0_12px_rgba(150,0,30,0.25)]',
  },
};

export function getPersonaTheme(personaId: string): PersonaTheme {
  return PERSONA_THEMES[personaId] || PERSONA_THEMES.bananabot;
}
