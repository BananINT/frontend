import { useState, createContext, useContext, memo, type ComponentPropsWithoutRef } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Copy, Check, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { MermaidRenderer } from './MermaidRenderer';
import { LatexBlock } from './LatexBlock';

const MarkdownPreviewContext = createContext<((htmlCode: string, title?: string) => void) | undefined>(undefined);

function MarkdownCodeBlock({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) {
  const match = /language-(\w+)/.exec(className || '');
  const isInline = !match && !String(children).includes('\n');

  if (isInline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[11px] border border-white/10 inline-block align-baseline select-text"
        {...props}
      >
        {children}
      </code>
    );
  }

  const codeString = String(children).replace(/\n$/, '');
  const lang = (match ? match[1] : 'code').toLowerCase();

  if (lang === 'mermaid') {
    return <MermaidRenderer code={codeString} />;
  }

  if (lang === 'latex' || lang === 'tex' || lang === 'math' || lang === 'katex') {
    return <LatexBlock code={codeString} />;
  }

  return <CodeBlock code={codeString} language={lang} />;
}

const STATIC_MARKDOWN_COMPONENTS: Components = {
  h1: ({ children }) => (
    <h1 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/15 pb-1.5 mt-4 mb-2.5 flex items-center gap-2 font-mono">
      <span className="w-1.5 h-1.5 rounded-full bg-white/60 inline-block" />
      <span>{children}</span>
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xs font-bold text-white uppercase tracking-wider mt-3.5 mb-2 border-l-2 border-white/40 pl-2.5 font-mono">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide mt-2.5 mb-1.5 font-mono">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="my-2 leading-relaxed text-zinc-200/90 break-words font-sans">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1.5 my-2.5 text-zinc-300 pl-1 font-sans">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1.5 my-2.5 text-zinc-300 pl-1 font-sans">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed text-zinc-200/95">
      {children}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-white/30 bg-white/[0.02] pl-3 py-1.5 my-2.5 text-zinc-400 italic text-xs rounded-r">
      {children}
    </blockquote>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-white tracking-wide">
      {children}
    </strong>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-3 border border-white/10 rounded-xl bg-black/40 shadow-lg custom-scrollbar">
      <table className="w-full border-collapse text-left text-xs min-w-[320px]">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-white/[0.05] text-white/90 font-mono font-bold border-b border-white/15 text-[10px] uppercase tracking-wider">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-white/5">
      {children}
    </tbody>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-white/[0.025] transition-colors">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="px-3.5 py-2.5 font-bold text-white/90 font-mono">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3.5 py-2.5 text-[11px] text-zinc-300 font-sans">
      {children}
    </td>
  ),
  code: MarkdownCodeBlock,
};

interface MarkdownMessageProps {
  content: string;
  onPreview?: (htmlCode: string, title?: string) => void;
}

export const MarkdownMessage = memo(function MarkdownMessage({ content, onPreview }: MarkdownMessageProps) {
  return (
    <MarkdownPreviewContext.Provider value={onPreview}>
      <div className="text-[13px] leading-relaxed max-w-full overflow-hidden text-zinc-200 font-sans markdown-content select-text">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={STATIC_MARKDOWN_COMPONENTS}
        >
          {content}
        </ReactMarkdown>
      </div>
    </MarkdownPreviewContext.Provider>
  );
});

function CodeBlock({ 
  code, 
  language,
}: { 
  code: string; 
  language: string; 
}) {
  const onPreview = useContext(MarkdownPreviewContext);
  const [copied, setCopied] = useState(false);
  const lineCount = code.split('\n').length;

  const isHtmlApp = 
    (language.toLowerCase() === 'html' || language.toLowerCase() === 'htm') && 
    (code.includes('<!DOCTYPE') || code.includes('<html') || code.includes('<canvas') || code.includes('<body>'));

  // User manual toggle preference overrides default calculation and persists across parent re-renders
  const [userCollapsed, setUserCollapsed] = useState<boolean | null>(null);
  const isCollapsed = userCollapsed !== null ? userCollapsed : (isHtmlApp || lineCount > 15);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  const handleLaunchPreview = () => {
    if (!onPreview) return;
    const titleMatch = /<title>(.*?)<\/title>/i.exec(code);
    const title = titleMatch ? titleMatch[1] : 'Jeu HTML5 Sandbox';
    onPreview(code, title);
  };

  return (
    <div className="my-3 rounded-xl border border-white/15 bg-[#0a0a0a] overflow-hidden shadow-2xl font-mono">
      {/* Terminal Window Header (Minimalist Monochrome - Compact) */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-white/[0.03] border-b border-white/10 text-[9px] uppercase text-white/50 tracking-wider">
        <div className="flex items-center gap-2">
          {/* Minimalist Monochrome Window Dots */}
          <div className="flex items-center gap-1 opacity-60">
            <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
          </div>

          <div className="flex items-center gap-1.5 pl-0.5">
            <span className="font-bold text-white/80">{language}</span>
            <span className="text-white/30 text-[8px]">
              ({lineCount} {lineCount > 1 ? 'lignes' : 'ligne'})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isHtmlApp && onPreview && (
            <button
              type="button"
              onClick={handleLaunchPreview}
              className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Lancer le jeu dans la Sandbox Split View"
            >
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>Tester dans la Sandbox</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            title="Copier le code"
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

      {/* Code Text Area (High-contrast Monochrome) */}
      <div className={`relative ${isCollapsed ? 'max-h-48 overflow-hidden' : 'max-h-[600px] overflow-y-auto'}`}>
        <div className="p-3.5 overflow-x-auto text-[11px] font-mono text-zinc-200 custom-scrollbar leading-relaxed select-text">
          <pre className="select-text">
            <code className="select-text">{code}</code>
          </pre>
        </div>

        {/* Fading gradient when collapsed */}
        {isCollapsed && (
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Collapse / Expand Toggle Bar */}
      {lineCount > 15 && (
        <div className="border-t border-white/10 bg-white/[0.02] px-3 py-1 flex items-center justify-between text-[9px] font-mono text-white/60">
          <button
            type="button"
            onClick={() => setUserCollapsed(!isCollapsed)}
            className="flex items-center gap-1 text-white/70 hover:text-white transition-colors font-bold cursor-pointer"
          >
            {isCollapsed ? (
              <>
                <ChevronDown className="w-3 h-3" />
                <span>Déplier le code ({lineCount} lignes)</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3 h-3" />
                <span>Réduire le code</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
