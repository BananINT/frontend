import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MarkdownArticleRenderer } from './MarkdownArticleRenderer';

describe('MarkdownArticleRenderer', () => {
    it('keeps inline code inline and colors a fenced language block', () => {
        const markdown = 'Use `const` here.\n\n```js\nconst count = 1;\n```';
        const html = renderToStaticMarkup(createElement(MarkdownArticleRenderer, { content: markdown }));
        expect(html).toMatch(/<p[^>]*>Use <code[^>]*>const<\/code> here\.<\/p>/);
        expect(html).toContain('hljs-keyword');
        expect(html.match(/<pre/g)).toHaveLength(1);
    });

    it('reserves the diagram space without flashing raw Mermaid source', () => {
        const html = renderToStaticMarkup(createElement(MarkdownArticleRenderer, { content: '```mermaid\nflowchart LR\n A --> B\n```' }));
        expect(html).toContain('aria-label="Diagramme de l’article"');
        expect(html).toContain('aria-busy="true"');
        expect(html).not.toContain('flowchart LR');
        expect(html).not.toContain('hljs-keyword');
    });

    it('renders the published clicker Mermaid diagram directly', () => {
        const content = '```mermaid\nflowchart LR\n A[Cliquer] --> B[Gagner des bananes]\n D --> A\n```';
        const html = renderToStaticMarkup(createElement(MarkdownArticleRenderer, { content }));
        expect(html).toContain('src="/blog/diagram-clicker.svg"');
        expect(html).not.toContain('aria-busy');
    });
});
