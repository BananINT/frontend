import { isValidElement, memo, useEffect, useState, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Link } from 'react-router';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import sql from 'highlight.js/lib/languages/sql';
import 'highlight.js/styles/github-dark.css';
import { Check, Copy, ExternalLink, Hash } from 'lucide-react';
import { slugify } from '../utils';

for (const [name, definition] of Object.entries({
    javascript, js: javascript, typescript, ts: typescript, python, py: python,
    bash, sh: bash, json, css, html: xml, xml, sql,
})) {
    if (!hljs.getLanguage(name)) hljs.registerLanguage(name, definition);
}

interface MarkdownArticleRendererProps {
    content: string;
}

const mermaidMarkup = new Map<string, string>();
const mermaidPending = new Map<string, Promise<string>>();
let mermaidId = 0;

function getMermaidMarkup(source: string): Promise<string> {
    const cached = mermaidMarkup.get(source);
    if (cached) return Promise.resolve(cached);
    const existing = mermaidPending.get(source);
    if (existing) return existing;

    const pending = import('mermaid').then(async ({ default: mermaid }) => {
        mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'default' });
        const { svg } = await mermaid.render(`blog-diagram-${++mermaidId}`, source);
        mermaidMarkup.set(source, svg);
        return svg;
    }).finally(() => mermaidPending.delete(source));
    mermaidPending.set(source, pending);
    return pending;
}

function MermaidDiagram({ source }: { source: string }) {
    if (source.includes('A[Cliquer] --> B[Gagner des bananes]') && source.includes('D --> A')) {
        return <figure className="my-8 overflow-hidden rounded-3xl border border-banan-primary/25 bg-[#0c0d09] shadow-[0_0_45px_rgba(250,255,0,0.08)]"><img src="/blog/diagram-clicker.svg" alt="La boucle du clicker : cliquer, gagner des bananes, choisir une amélioration, observer la progression, puis recommencer" className="w-full" /></figure>;
    }

    return <DynamicMermaidDiagram source={source} />;
}

function DynamicMermaidDiagram({ source }: { source: string }) {
    const [svg, setSvg] = useState<string | null>(() => mermaidMarkup.get(source) ?? null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let active = true;
        getMermaidMarkup(source).then(markup => {
            if (active) setSvg(markup);
        }).catch(() => { if (active) setFailed(true); });
        return () => { active = false; };
    }, [source]);

    if (failed) return <pre className="my-8 overflow-x-auto border border-red-500/30 bg-black/70 p-5 text-sm"><code>{source}</code></pre>;

    return <figure className="my-8 min-h-60 overflow-x-auto rounded-3xl border border-white/15 bg-[#f7f8f2] p-5" role="img" aria-label="Diagramme de l’article" aria-busy={!svg} dangerouslySetInnerHTML={svg ? { __html: svg } : undefined} />;
}

function CodeBlock({ code, language }: { code: string; language: string }) {
    const [copied, setCopied] = useState(false);
    const highlighted = hljs.getLanguage(language)
        ? hljs.highlight(code, { language, ignoreIllegals: true }).value
        : null;

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className="my-8 max-w-full overflow-hidden rounded-xl border border-white/15 bg-[#0d1117] text-sm">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-white/65">
                <span className="font-mono">{language || 'Texte'}</span>
                <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded px-2 py-1 hover:bg-white/10 hover:text-white" aria-label="Copier le code">
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copié' : 'Copier'}
                </button>
            </div>
            <pre className="overflow-x-auto p-5 leading-relaxed"><code className={highlighted ? 'hljs' : undefined} dangerouslySetInnerHTML={highlighted ? { __html: highlighted } : undefined}>{highlighted ? undefined : code}</code></pre>
        </div>
    );
}

function headingText(children: ReactNode): string {
    if (typeof children === 'string' || typeof children === 'number') return String(children);
    if (Array.isArray(children)) return children.map(headingText).join('');
    if (isValidElement<{ children?: ReactNode }>(children)) return headingText(children.props.children);
    return '';
}

function Heading({ level, children }: { level: 2 | 3; children: ReactNode }) {
    const id = slugify(headingText(children));
    const className = level === 2
        ? 'group mt-14 mb-6 scroll-mt-24 font-sans text-2xl font-black uppercase tracking-tight text-banan-primary drop-shadow-[0_0_18px_rgba(250,255,0,0.18)] sm:text-3xl'
        : 'group mt-9 mb-4 scroll-mt-24 font-sans text-xl font-bold uppercase tracking-tight text-white sm:text-2xl';
    const contents = <>{children}<a href={`#${id}`} aria-label="Lien direct vers cette section" className="ml-2 inline-block align-middle text-banan-primary opacity-50 hover:opacity-100"><Hash className="h-4 w-4" /></a></>;
    return level === 2 ? <h2 id={id} className={className}>{contents}</h2> : <h3 id={id} className={className}>{contents}</h3>;
}

export const MarkdownArticleRenderer = memo(function MarkdownArticleRenderer({ content }: MarkdownArticleRendererProps) {
    return (
        <div className="article-markdown w-full min-w-0 max-w-[100ch] font-sans text-lg leading-9 text-white/85 xl:text-xl">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    h1: ({ children }) => <h2 className="mt-10 font-sans text-2xl font-black uppercase text-banan-primary">{children}</h2>,
                    h2: ({ children }) => <Heading level={2}>{children}</Heading>,
                    h3: ({ children }) => <Heading level={3}>{children}</Heading>,
                    p: ({ children }) => <p className="my-6">{children}</p>,
                    ul: ({ children }) => <ul className="my-5 list-disc space-y-2 pl-6">{children}</ul>,
                    ol: ({ children }) => <ol className="my-5 list-decimal space-y-2 pl-6">{children}</ol>,
                    li: ({ children }) => <li className="pl-1">{children}</li>,
                    blockquote: ({ children }) => <blockquote className="my-7 rounded-r-2xl border-l-4 border-banan-primary/70 bg-banan-primary/[0.06] px-5 py-2 text-white/80">{children}</blockquote>,
                    table: ({ children }) => <div className="my-8 max-w-full overflow-x-auto rounded-lg border border-white/15"><table className="w-full border-collapse text-left text-sm">{children}</table></div>,
                    th: ({ children }) => <th className="border-b border-white/15 bg-white/5 px-4 py-2 font-semibold text-white">{children}</th>,
                    td: ({ children }) => <td className="border-b border-white/10 px-4 py-2">{children}</td>,
                    hr: () => <hr className="my-10 border-white/15" />,
                    a: ({ href, children }) => {
                        if (!href) return <span>{children}</span>;
                        const className = 'font-medium text-banan-primary underline decoration-banan-primary/40 underline-offset-4 hover:decoration-banan-primary';
                        if (href.startsWith('#')) return <a href={href} className={className}>{children}</a>;
                        if (href.startsWith('/')) return <Link to={href} className={className}>{children}</Link>;
                        if (!/^https?:\/\//i.test(href)) return <a href={href} className={className}>{children}</a>;
                        return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}<ExternalLink className="ml-1 inline h-3 w-3" /></a>;
                    },
                    code: ({ children, className }) => <code className={`rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.88em] text-banan-primary ${className || ''}`}>{children}</code>,
                    pre: ({ children }) => {
                        if (!isValidElement<{ children?: ReactNode; className?: string }>(children)) return <pre>{children}</pre>;
                        const code = String(children.props.children ?? '').replace(/\n$/, '');
                        const language = /language-([\w-]+)/.exec(children.props.className || '')?.[1]?.toLowerCase() || '';
                        if (language === 'mermaid') return <MermaidDiagram key={code} source={code} />;
                        return <CodeBlock code={code} language={language} />;
                    },
                }}
            >{content}</ReactMarkdown>
        </div>
    );
});
