import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: React.ReactNode;
    children: React.ReactNode;
    borderColor?: string;
}

export default function Modal({ isOpen, onClose, title, children, borderColor = 'border-banan-primary' }: ModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

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
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className={`bg-black border ${borderColor} w-full max-w-lg shadow-2xl pointer-events-auto flex flex-col max-h-[90vh]`}
                        >
                            <div className={`flex items-center justify-between p-4 border-b ${borderColor} bg-banan-primary/5`}>
                                <h2 className={`text-xl font-black ${textColor} uppercase tracking-tighter`}>
                                    {title}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="text-white hover:text-banan-primary transition-colors"
                                >
                                    <X />
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
