import { useState } from 'react';
import {
  Terminal,
  Activity,
  CheckCircle2,
  ChevronDown,
  Copy,
  Check,
  AlertCircle,
  TrendingUp,
  Calculator,
  Shield,
  UserCheck,
  Zap,
  Sparkles,
  PieChart,
  Dna,
  Trophy,
  Volume2,
  Boxes,
  Gamepad2,
  BarChart3,
  ShieldAlert,
  Cpu,
  FileCode,
  Crosshair,
  Award,
  Ticket,
  Palette,
  PlaySquare,
  Layers,
  Sparkle,
  Music,
  History,
  Target,
  Flame,
  Clock,
  Network,
  Dice5,
  Vote,
  Receipt,
} from 'lucide-react';
import type { ToolCallDetail } from '../types';

interface ToolCallInspectorProps {
  toolCalls?: (string | ToolCallDetail)[] | null;
  isLive?: boolean;
}

function getToolMetadata(name: string) {
  switch (name) {
    // Bananabot tools
    case 'get_player_telemetry':
      return {
        label: 'Télémétrie Joueur',
        icon: UserCheck,
        color: 'text-amber-400',
      };
    case 'recommend_optimal_upgrades':
      return {
        label: 'Optimisation Upgrades',
        icon: Sparkles,
        color: 'text-yellow-400',
      };
    case 'simulate_ascension_readiness':
      return {
        label: 'Simulateur Ascension',
        icon: Dna,
        color: 'text-purple-400',
      };
    case 'consult_game_leaderboard':
      return {
        label: 'Panthéon des Bananiers',
        icon: Trophy,
        color: 'text-amber-300',
      };
    case 'audit_achievements_and_milestones':
      return {
        label: 'Succès & Trophées',
        icon: Award,
        color: 'text-yellow-300',
      };
    case 'simulate_prestige_dna_tree':
      return {
        label: 'Arbre ADN Prestige',
        icon: Layers,
        color: 'text-purple-300',
      };
    case 'track_banana_lottery':
      return {
        label: 'Loterie Potassium',
        icon: Ticket,
        color: 'text-amber-500',
      };
    case 'browse_theme_customizations':
      return {
        label: 'Customisation Thèmes',
        icon: Palette,
        color: 'text-orange-400',
      };

    // Cyber-Architect tools
    case 'get_retro_audio_snippets':
      return {
        label: 'Audio Synthétiseur 8-bit',
        icon: Volume2,
        color: 'text-emerald-400',
      };
    case 'get_canvas_physics_blueprint':
      return {
        label: 'Moteur Physique Canvas',
        icon: Boxes,
        color: 'text-teal-400',
      };
    case 'catalog_banana_lore_assets':
      return {
        label: 'Lore & Sprite Blueprint',
        icon: Gamepad2,
        color: 'text-lime-400',
      };
    case 'generate_game_loop_boilerplate':
      return {
        label: 'Boucle de Jeu (Canvas)',
        icon: PlaySquare,
        color: 'text-emerald-300',
      };
    case 'get_procedural_level_generator':
      return {
        label: 'Générateur Procédural',
        icon: Layers,
        color: 'text-teal-300',
      };
    case 'get_juice_and_screen_shake_fx':
      return {
        label: 'Juice & Screen Shake FX',
        icon: Sparkle,
        color: 'text-lime-300',
      };
    case 'generate_retro_synth_melody':
      return {
        label: 'Mélodie Synth Chiptune',
        icon: Music,
        color: 'text-cyan-400',
      };

    // Gordon Gekko tools
    case 'scan_market_tickers':
      return {
        label: 'Marché BNDAQ',
        icon: TrendingUp,
        color: 'text-cyan-400',
      };
    case 'audit_player_finances':
      return {
        label: 'Audit Financier & PnL',
        icon: PieChart,
        color: 'text-blue-400',
      };
    case 'analyze_stock_technicals':
      return {
        label: 'Analyse Technique OHLC',
        icon: BarChart3,
        color: 'text-cyan-300',
      };
    case 'screen_futures_and_dividends':
      return {
        label: 'Futures & Dividendes',
        icon: Zap,
        color: 'text-sky-400',
      };
    case 'inspect_recent_market_trades':
      return {
        label: 'Historique des Transactions',
        icon: History,
        color: 'text-blue-300',
      };
    case 'calculate_limit_order_strategy':
      return {
        label: 'Stratégie Limit Orders',
        icon: Target,
        color: 'text-sky-300',
      };
    case 'simulate_market_crash_or_rally':
      return {
        label: 'Simulation Krach / Rallye',
        icon: Flame,
        color: 'text-red-400',
      };
    case 'estimate_passive_dividend_timeline':
      return {
        label: 'Projection Dividendes',
        icon: Clock,
        color: 'text-emerald-400',
      };

    // PalantINT tools
    case 'probe_clan_vulnerabilities':
      return {
        label: 'Infiltration de Clan',
        icon: ShieldAlert,
        color: 'text-rose-500',
      };
    case 'scan_cyber_defense_matrix':
      return {
        label: 'Matrice Pare-feu',
        icon: Cpu,
        color: 'text-red-400',
      };
    case 'detect_clandestine_contracts':
      return {
        label: 'Contrats Clandestins',
        icon: FileCode,
        color: 'text-rose-400',
      };
    case 'simulate_heist_odds':
      return {
        label: 'Simulation Braquage',
        icon: Crosshair,
        color: 'text-red-500',
      };
    case 'intercept_osint_network_targets':
      return {
        label: 'Interception Cibles OSINT',
        icon: Network,
        color: 'text-violet-400',
      };
    case 'inspect_ape_roulette_cylinder':
      return {
        label: 'Barillet Roulette Singe',
        icon: Dice5,
        color: 'text-pink-400',
      };
    case 'eavesdrop_clan_democracy_votes':
      return {
        label: 'Écoute Votes Gouvernance',
        icon: Vote,
        color: 'text-rose-300',
      };
    case 'audit_clan_treasury_ledger':
      return {
        label: 'Grand Livre du Trésor',
        icon: Receipt,
        color: 'text-amber-400',
      };

    // Legacy / General tools
    case 'eval_math_expression':
      return {
        label: 'Calculateur AST',
        icon: Calculator,
        color: 'text-indigo-400',
      };
    case 'inspect_bananier_stats':
      return {
        label: 'Statistiques Joueur',
        icon: UserCheck,
        color: 'text-amber-400',
      };
    case 'scan_live_market':
      return {
        label: 'Marché BNDAQ',
        icon: TrendingUp,
        color: 'text-cyan-400',
      };
    case 'evaluate_portfolio':
      return {
        label: 'Portefeuille Actions',
        icon: PieChart,
        color: 'text-emerald-400',
      };
    case 'simulate_short_squeeze':
      return {
        label: 'Simulation Squeeze',
        icon: Zap,
        color: 'text-amber-400',
      };
    case 'scan_clan_target':
      return {
        label: 'Infiltration Clan',
        icon: Shield,
        color: 'text-rose-400',
      };
    case 'trigger_chaos_glitch':
      return {
        label: 'Glitch Quantique',
        icon: Sparkles,
        color: 'text-purple-400',
      };

    default:
      if (name.startsWith('palantint_') || name.startsWith('mcp_') || name.includes('_')) {
        const formatted = name
          .replace(/^(mcp_|palantint_)/, '')
          .split('_')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        return {
          label: `[MCP] ${formatted}`,
          icon: Network,
          color: 'text-violet-400',
        };
      }
      return {
        label: name,
        icon: Terminal,
        color: 'text-emerald-400',
      };
  }
}

function getInlineArgPreview(args?: Record<string, unknown>): string | null {
  if (!args || Object.keys(args).length === 0) return null;
  if (args.sound_type) return String(args.sound_type);
  if (args.melody_type) return String(args.melody_type);
  if (args.fx_type) return String(args.fx_type);
  if (args.generator_type) return String(args.generator_type);
  if (args.game_title) return String(args.game_title);
  if (args.mechanic) return String(args.mechanic);
  if (args.symbol) return String(args.symbol);
  if (args.scenario) return String(args.scenario);
  if (args.clan_name_or_id) return String(args.clan_name_or_id);
  if (args.target_uid) return String(args.target_uid);
  if (args.target_treasury) return `${Number(args.target_treasury).toLocaleString()} 🍌`;
  if (args.category) return String(args.category);
  if (args.scope) return String(args.scope);
  if (args.mode) return String(args.mode);
  if (args.entity) return String(args.entity);
  if (args.expression) return String(args.expression);
  if (args.target) return String(args.target);

  const entries = Object.entries(args);
  if (entries.length === 1) {
    return `${entries[0][0]}: ${String(entries[0][1])}`;
  }
  return null;
}

export function ToolCallInspector({ toolCalls, isLive = false }: ToolCallInspectorProps) {
  if (!toolCalls || toolCalls.length === 0) return null;

  const normalized: ToolCallDetail[] = toolCalls.map((t) => {
    if (typeof t === 'string') {
      return { name: t, status: 'completed' };
    }
    return t;
  });

  return (
    <div className="my-2 flex flex-col gap-1.5 w-full font-mono select-text">
      {normalized.map((tool, idx) => (
        <LeanToolAccordionItem key={`${tool.name}-${idx}`} tool={tool} isLive={isLive} />
      ))}
    </div>
  );
}

function LeanToolAccordionItem({ tool, isLive }: { tool: ToolCallDetail; isLive?: boolean }) {
  const isRunning = tool.status === 'running' || (isLive && !tool.result);
  const [isOpen, setIsOpen] = useState(isRunning);
  const [copiedResult, setCopiedResult] = useState(false);

  const hasArgs = tool.arguments && Object.keys(tool.arguments).length > 0;
  const hasResult = tool.result !== undefined && tool.result !== null;

  // Check if result indicates an error
  const rawResult = tool.result as Record<string, unknown> | undefined;
  const errorMessage = rawResult?.error
    ? String(rawResult.error)
    : rawResult?.detail
    ? String(rawResult.detail)
    : null;
  const isError = tool.status === 'error' || Boolean(errorMessage);

  const meta = getToolMetadata(tool.name);
  const ToolIcon = meta.icon;
  const inlinePreview = getInlineArgPreview(tool.arguments);

  const handleCopyResult = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasResult) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(tool.result, null, 2));
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 2000);
    } catch {
      // Ignore clipboard error
    }
  };

  return (
    <div className="rounded-lg border border-white/10 bg-black/70 overflow-hidden shadow-md transition-all">
      {/* Sleek Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-white/[0.04] transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded bg-white/[0.04] border border-white/10 flex-shrink-0">
            <ToolIcon className={`w-3.5 h-3.5 ${meta.color}`} />
          </div>

          <div className="flex items-center gap-1.5 truncate text-[11px]">
            <span className="font-semibold text-white/90 truncate">
              {meta.label}
            </span>

            {inlinePreview && (
              <span className="text-[10px] text-banan-primary/80 font-mono truncate max-w-[200px] sm:max-w-xs">
                ({inlinePreview})
              </span>
            )}
          </div>
        </div>

        {/* Minimalist Status Badge & Chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isRunning ? (
            <span className="flex items-center gap-1 text-[10px] text-amber-300 font-mono">
              <Activity className="w-2.5 h-2.5 animate-spin" />
              <span>En cours</span>
            </span>
          ) : isError ? (
            <span className="flex items-center gap-1 text-[10px] text-red-400 font-mono font-bold">
              <AlertCircle className="w-2.5 h-2.5" />
              <span>Échec</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>Terminé</span>
            </span>
          )}

          <ChevronDown
            className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Accordion Expandable Body */}
      {isOpen && (
        <div className="px-3 pb-3 pt-1 border-t border-white/5 flex flex-col gap-2 text-[11px] bg-white/[0.01] select-text">
          {/* Optional Arguments */}
          {hasArgs && (
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase tracking-wider text-white/40 font-bold">
                Paramètres
              </span>
              <pre className="p-2 rounded bg-black/90 border border-white/10 text-white/80 overflow-x-auto custom-scrollbar text-[10px] leading-relaxed select-text">
                <code>{JSON.stringify(tool.arguments, null, 2)}</code>
              </pre>
            </div>
          )}

          {/* Error Alert Display */}
          {errorMessage && (
            <div className="p-2 rounded bg-red-950/40 border border-red-500/30 text-red-200 text-[10px] flex items-start gap-1.5 font-mono select-text">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Results Section */}
          {hasResult ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider text-white/40 font-bold">
                  Résultat
                </span>
                <button
                  type="button"
                  onClick={handleCopyResult}
                  className="flex items-center gap-1 text-[9px] text-white/50 hover:text-white transition-colors cursor-pointer"
                  title="Copier les données JSON"
                >
                  {copiedResult ? (
                    <>
                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-2.5 h-2.5" />
                      <span>Copier JSON</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-2 rounded bg-black/90 border border-white/10 text-white/85 max-h-44 overflow-y-auto custom-scrollbar text-[10px] leading-relaxed font-mono select-text">
                <code>{JSON.stringify(tool.result, null, 2)}</code>
              </pre>
            </div>
          ) : isRunning ? (
            <div className="flex items-center gap-1.5 p-2 rounded bg-white/[0.02] border border-white/5 text-[10px] text-amber-300/80 animate-pulse font-mono">
              <Activity className="w-2.5 h-2.5 animate-spin" />
              <span>Exécution de l&apos;action système...</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
