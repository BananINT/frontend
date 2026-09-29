import { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import type { BlogFaq } from '../types';
import { cn } from '@app/lib/utils';

interface FaqSectionProps {
    faqs: BlogFaq[];
}

export function FaqSection({ faqs }: FaqSectionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    if (!faqs || faqs.length === 0) return null;

    const toggle = (idx: number) => {
        setOpenIndex(prev => prev === idx ? null : idx);
    };

    return (
        <section className="my-10 pt-8 border-t border-white/10" aria-label="Questions fréquentes">
            <div className="flex items-center gap-2 mb-6">
                <HelpCircle className="w-5 h-5 text-banan-primary" />
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white font-sans">
                    Questions Fréquentes (FAQ)
                </h2>
            </div>

            <div className="divide-y divide-white/15 border-y border-white/15">
                {faqs.map((faq, idx) => {
                    const isOpen = openIndex === idx;
                    return (
                        <div
                            key={idx}
                            className="transition-colors duration-200"
                        >
                            <button
                                type="button"
                                onClick={() => toggle(idx)}
                                className="w-full flex items-center justify-between py-5 text-left font-sans font-bold text-base sm:text-lg text-white hover:text-banan-primary transition-colors cursor-pointer"
                                aria-expanded={isOpen}
                            >
                                <span className="pr-4">{faq.question}</span>
                                <ChevronDown
                                    className={cn(
                                        "w-5 h-5 text-white/60 shrink-0 transition-transform duration-200",
                                        isOpen && "rotate-180 text-banan-primary"
                                    )}
                                />
                            </button>

                            {isOpen && (
                                <div className="pb-5 text-base text-white/85 font-sans leading-relaxed">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
