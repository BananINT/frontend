import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: React.ReactNode;
    children: React.ReactNode;
    borderColor?: string;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

export default function Modal({ isOpen, onClose, title, children, borderColor = 'border-banan-primary' }: ModalProps) {
    const titleId = useId();
    const dialogRef = useRef<HTMLDivElement>(null);
    // Latest onClose without re-running the focus effect when callers pass an inline arrow.
    const onCloseRef = useRef(onClose);
    useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;
        const previouslyFocused = document.activeElement as HTMLElement | null;

        const focusables = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
            .filter(el => el.getClientRects().length > 0);

        // Move focus inside once the dialog is mounted.
        const raf = requestAnimationFrame(() => {
            const dialog = dialogRef.current;
            if (!dialog || dialog.contains(document.activeElement)) return;
            (focusables()[0] ?? dialog).focus();
        });

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCloseRef.current();
                return;
            }
            if (e.key !== 'Tab' || !dialogRef.current) return;
            const items = focusables();
            if (items.length === 0) {
                e.preventDefault();
                dialogRef.current.focus();
                return;
            }
            const first = items[0];
            const last = items[items.length - 1];
            const active = document.activeElement;
            if (e.shiftKey && (active === first || !dialogRef.current.contains(active))) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && (active === last || !dialogRef.current.contains(active))) {
                e.preventDefault();
                first.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('keydown', handleKeyDown);
            if (previouslyFocused && previouslyFocused.isConnected) previouslyFocused.focus();
        };
    }, [isOpen]);

    const textColors: Record<string, string> = {
        'border-banan-primary': 'text-banan-primary',
        'border-banan-cyber': 'text-banan-cyber',
        'border-banan-osint': 'text-banan-osint',
        'border-banan-algo': 'text-banan-algo',
        'border-banan-market': 'text-banan-market',
        'border-banan-warning': 'text-banan-warning',
        'border-banan-reward': 'text-banan-reward',
        'border-banan-shop': 'text-banan-shop',
    };

    const textColor = textColors[borderColor] || 'text-banan-primary';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto"
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            ref={dialogRef}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={titleId}
                            tabIndex={-1}
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className={`bg-black border ${borderColor} w-full max-w-lg shadow-2xl pointer-events-auto flex flex-col max-h-[90vh] focus:outline-none`}
                        >
                            <div className={`flex items-center justify-between p-4 border-b ${borderColor} bg-banan-primary/5`}>
                                <h2 id={titleId} className={`text-xl font-black ${textColor} uppercase tracking-tighter`}>
                                    {title}
                                </h2>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label="Fermer"
                                    className="text-white hover:text-banan-primary transition-colors"
                                >
                                    <X aria-hidden="true" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
