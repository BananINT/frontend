import { useState } from 'react';
import { Download, Check, Copy, FileArchive, ShieldCheck } from 'lucide-react';
import type { BlogDownload } from '../types';

interface DownloadSectionProps {
    downloads: BlogDownload[];
}

export function DownloadSection({ downloads }: DownloadSectionProps) {
    const [copiedHash, setCopiedHash] = useState<string | null>(null);

    if (!downloads || downloads.length === 0) return null;

    const copySha256 = (hash: string, id: string) => {
        navigator.clipboard.writeText(hash);
        setCopiedHash(id);
        setTimeout(() => setCopiedHash(null), 2000);
    };

    return (
        <section className="my-10 pt-8 border-t border-white/10" aria-label="Fichiers téléchargeables">
            <div className="flex items-center gap-2 mb-6">
                <Download className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white font-sans">
                    Téléchargements & Archives
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {downloads.map((item, idx) => {
                    const isCopied = copiedHash === item.filename;

                    return (
                        <div
                            key={idx}
                            className="p-5 rounded-lg border border-purple-500/20 bg-gradient-to-br from-[#120f17] to-[#0c0a0f] hover:border-purple-500/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                                    <FileArchive className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                                         <h3 className="font-bold text-lg sm:text-xl text-white font-sans">
                                             {item.title}
                                         </h3>
                                         <span className="text-xs font-mono px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase font-bold">
                                             {item.format}
                                         </span>
                                         <span className="text-xs font-mono text-white/70">
                                             {item.size}
                                         </span>
                                     </div>
                                     <p className="text-sm sm:text-base text-white/85 font-sans max-w-xl leading-relaxed mb-3">
                                         {item.description}
                                     </p>
                                     {item.sha256 && (
                                         <div className="flex items-center gap-2 text-xs font-mono text-white/70">
                                             <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                             <span className="truncate max-w-[200px] sm:max-w-xs font-mono">
                                                 SHA-256: {item.sha256}
                                             </span>
                                             <button
                                                 type="button"
                                                 onClick={() => copySha256(item.sha256!, item.filename)}
                                                 className="text-white/75 hover:text-white transition-colors cursor-pointer"
                                                 title="Copier le hash SHA-256"
                                             >
                                                 {isCopied ? (
                                                     <Check className="w-3.5 h-3.5 text-emerald-400 inline" />
                                                 ) : (
                                                     <Copy className="w-3.5 h-3.5 inline" />
                                                 )}
                                             </button>
                                         </div>
                                     )}
                                </div>
                            </div>

                            <a
                                href={item.downloadUrl}
                                download={item.filename}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded bg-purple-500 hover:bg-purple-400 text-black font-bold font-mono text-sm uppercase tracking-wider transition-colors shrink-0 shadow-md cursor-pointer"
                            >
                                <Download className="w-4 h-4" />
                                <span>Télécharger</span>
                            </a>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
