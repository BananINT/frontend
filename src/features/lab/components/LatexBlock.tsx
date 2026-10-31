import { useState, useMemo } from 'react';
import katex from 'katex';
import { Sigma, Copy, Check } from 'lucide-react';

interface LatexBlockProps {
  code: string;
}

export function LatexBlock({ code }: LatexBlockProps) {
  const [copied, setCopied] = useState(false);
  const cleanCode = code.trim();

  const renderedHtml = useMemo(() => {
    try {
      return katex.renderToString(cleanCode, {
        displayMode: true,
        throwOnError: false,
      });
    } catch {
      return null;
    }
  }, [cleanCode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard error
    }
  };

  if (!renderedHtml) {
    return (
      <pre className="my-3 p-3 bg-black/60 rounded border border-white/10 text-xs text-zinc-300 overflow-x-auto font-mono select-text">
        <code className="select-text">{cleanCode}</code>
      </pre>
    );
  }

  return (
    <div className="my-3 rounded-xl border border-white/15 bg-[#0a0a0a] overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.04] border-b border-white/10 text-[11px] text-white/70 font-mono">
        <div className="flex items-center gap-2">
          <Sigma className="w-3.5 h-3.5 text-banan-primary" />
          <span className="font-bold uppercase tracking-wider text-white/90">Formule LaTeX</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer text-[11px]"
          title="Copier le code LaTeX"
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

      {/* Rendered Math Formula */}
      <div className="p-4 overflow-x-auto flex justify-center items-center bg-black/40 text-white font-sans text-sm sm:text-base select-text">
        <div
          className="max-w-full text-center leading-normal [&_.katex-display]:my-0 select-text"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>
    </div>
  );
}
