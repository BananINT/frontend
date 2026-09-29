import { useEffect, useState, useMemo } from 'react';
import { ListOrdered } from 'lucide-react';
import { cn } from '@app/lib/utils';
import { slugify } from '../utils';

interface TocItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
    const [activeId, setActiveId] = useState<string>('');

    // Extract headings from markdown synchronously
    const headings = useMemo<TocItem[]>(() => {
        const lines = content.split('\n');
        const extracted: TocItem[] = [];

        for (const line of lines) {
            const match = /^(#{2,3})\s+(.*)$/.exec(line);
            if (match) {
                const level = match[1].length;
                const text = match[2].trim();
                const id = slugify(text);
                extracted.push({ id, text, level });
            }
        }

        return extracted;
    }, [content]);

    // Active heading intersection spy
    useEffect(() => {
        if (headings.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                        break;
                    }
                }
            },
            {
                rootMargin: '-80px 0% -60% 0%',
                threshold: 0.1,
            }
        );

        headings.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [headings]);

    if (headings.length === 0) return null;

    return (
        <nav className="border-l border-white/20 py-1 pl-5 text-sm font-mono select-none" aria-label="Sommaire">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-banan-primary mb-4 pb-2.5 border-b border-white/10 text-sm">
                <ListOrdered className="w-4 h-4" />
                <span>Sommaire</span>
            </div>

            <ul className="space-y-2.5">
                {headings.map((item) => (
                    <li
                        key={item.id}
                        className={cn(
                            "transition-colors",
                            item.level === 3 ? "pl-4 text-xs" : "font-medium text-sm"
                        )}
                    >
                        <a
                            href={`#${item.id}`}
                            className={cn(
                                "block py-1 truncate hover:text-banan-primary transition-colors",
                                activeId === item.id
                                    ? "text-banan-primary font-bold border-l-2 border-banan-primary pl-2.5"
                                    : "text-white/75"
                            )}
                        >
                            {item.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
