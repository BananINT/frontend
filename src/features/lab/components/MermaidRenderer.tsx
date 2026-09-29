import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Network, Code, Copy, Check, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';

// Initialize mermaid with BananINT cyber-dark theme settings
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  suppressErrorRendering: true,
  themeVariables: {
    darkMode: true,
    background: '#0a0a0a',
    primaryColor: '#1e293b',
    primaryTextColor: '#f8fafc',
    primaryBorderColor: '#475569',
    lineColor: '#94a3b8',
    secondaryColor: '#0f172a',
    tertiaryColor: '#1e293b',
    mainBkg: '#0d1117',
    nodeBorder: '#334155',
  },
  securityLevel: 'loose',
});

interface MermaidRendererProps {
  code: string;
}

// Global in-memory cache to prevent re-rendering and DOM race conditions on unmount/mount transitions
const mermaidSvgCache = new Map<string, string>();

export function MermaidRenderer({ code }: MermaidRendererProps) {
  const cleanCode = code.trim();
  const cachedSvg = mermaidSvgCache.get(cleanCode) || null;
  const [svgHtml, setSvgHtml] = useState<string | null>(cachedSvg);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'diagram' | 'code'>('diagram');
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displaySvg = svgHtml || cachedSvg;

  useEffect(() => {
    if (!cleanCode) return;

    // Fast path: if already cached, no need to run mermaid render
    if (mermaidSvgCache.has(cleanCode)) {
      return;
    }

    let isCancelled = false;

    const renderDiagram = async () => {
      const uniqueId = 'mermaid-' + Math.random().toString(36).substring(2, 10);
      try {
        // Pre-validate syntax to suppress error element creation during partial streaming
        const parseResult = await mermaid.parse(cleanCode, { suppressErrors: true }).catch(() => false);
        if (!parseResult) {
          if (!isCancelled) {
            setError('Syntaxe Mermaid incomplète ou invalide');
          }
          return;
        }

        const { svg } = await mermaid.render(uniqueId, cleanCode);
        mermaidSvgCache.set(cleanCode, svg);
        if (!isCancelled) {
          setSvgHtml(svg);
          setError(null);
        }
      } catch (err: unknown) {
        // Clean up only this specific element if it was left in document.body
        if (typeof document !== 'undefined') {
          const specific = document.getElementById(uniqueId) || document.getElementById(`d${uniqueId}`);
          if (specific && specific.parentElement === document.body) {
            specific.remove();
          }
        }
        if (!isCancelled) {
          const errMsg = err instanceof Error ? err.message : String(err);
          setError(errMsg);
        }
      }
    };

    renderDiagram();

    return () => {
      isCancelled = true;
    };
  }, [cleanCode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <div className="my-3 rounded-xl border border-white/15 bg-[#0a0a0a] overflow-hidden shadow-2xl font-mono">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.04] border-b border-white/10 text-[10px] text-white/70">
        <div className="flex items-center gap-2">
          <Network className="w-3.5 h-3.5 text-banan-primary" />
          <span className="font-bold uppercase tracking-wider text-white/90">Diagramme Mermaid</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Toggle View Mode */}
          {!error && (
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'diagram' ? 'code' : 'diagram')}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] bg-white/10 hover:bg-white/20 text-white/90 transition-all cursor-pointer"
              title={viewMode === 'diagram' ? 'Afficher la source Mermaid' : 'Afficher le diagramme rendu'}
            >
              {viewMode === 'diagram' ? (
                <>
                  <Code className="w-2.5 h-2.5" />
                  <span>Code</span>
                </>
              ) : (
                <>
                  <Network className="w-2.5 h-2.5" />
                  <span>Diagramme</span>
                </>
              )}
            </button>
          )}

          {/* Toggle Height Expansion */}
          {!error && viewMode === 'diagram' && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] bg-white/10 hover:bg-white/20 text-white/90 transition-all cursor-pointer"
              title={isExpanded ? 'Réduire la hauteur' : 'Afficher en plein format'}
            >
              {isExpanded ? (
                <>
                  <Minimize2 className="w-2.5 h-2.5" />
                  <span>Réduire</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-2.5 h-2.5" />
                  <span>Plein format</span>
                </>
              )}
            </button>
          )}

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer text-[9px]"
            title="Copier le code Mermaid"
          >
            {copied ? (
              <>
                <Check className="w-2.5 h-2.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copié</span>
              </>
            ) : (
              <>
                <Copy className="w-2.5 h-2.5" />
                <span>Copier</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Diagram Render Area or Code Fallback */}
      {error ? (
        <div className="p-3">
          <div className="flex items-center gap-1.5 text-amber-400/90 text-xs mb-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-[11px] font-sans">
              Syntaxe Mermaid en cours de complétion ou invalide. Affichage du code source brut :
            </span>
          </div>
          <pre className="p-3 bg-black/60 rounded border border-white/5 text-[11px] text-zinc-300 overflow-x-auto whitespace-pre select-text">
            <code className="select-text">{cleanCode}</code>
          </pre>
        </div>
      ) : viewMode === 'code' ? (
        <pre className="p-4 bg-black/80 text-[11px] text-zinc-300 overflow-x-auto whitespace-pre font-mono select-text">
          <code className="select-text">{cleanCode}</code>
        </pre>
      ) : (
        <div
          ref={containerRef}
          className={`p-4 overflow-auto flex justify-center items-start bg-black/40 min-h-[120px] custom-scrollbar ${
            isExpanded ? 'max-h-none' : 'max-h-[600px]'
          }`}
        >
          {displaySvg ? (
            <div
              className="w-full flex justify-center items-start [&_svg]:max-w-full [&_svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: displaySvg }}
            />
          ) : (
            <div className="text-white/40 text-xs flex items-center gap-2 py-6">
              <span className="w-2 h-2 rounded-full bg-banan-primary animate-ping" />
              <span>Génération du diagramme...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
