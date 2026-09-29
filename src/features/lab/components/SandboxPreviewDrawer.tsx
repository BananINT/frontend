import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  X, 
  Monitor, 
  Smartphone, 
  Download, 
  ShieldCheck, 
  Gamepad2,
  GripVertical
} from 'lucide-react';
import type { HtmlAppPreview } from '../types';

interface SandboxPreviewDrawerProps {
  previewApp: HtmlAppPreview | null;
  onClose: () => void;
}

export function SandboxPreviewDrawer({ previewApp, onClose }: SandboxPreviewDrawerProps) {
  const [reloadKey, setReloadKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  const [width, setWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return Math.min(800, Math.max(480, Math.floor(window.innerWidth * 0.45)));
    }
    return 600;
  });
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Drawer is docked to the right edge: width = window.innerWidth - clientX
      const newWidth = window.innerWidth - e.clientX;
      const minW = 380;
      const maxW = Math.max(minW, window.innerWidth - 420);
      setWidth(Math.min(maxW, Math.max(minW, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  if (!previewApp) return null;

  const handleDownload = () => {
    try {
      const blob = new Blob([previewApp.htmlCode], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${previewApp.title.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'game'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download html file', err);
    }
  };

  return (
    <AnimatePresence>
      {/* Fullscreen overlay to capture mouse drag smoothly without iframe interference */}
      {isResizing && (
        <div className="fixed inset-0 z-50 cursor-ew-resize select-none pointer-events-auto" />
      )}

      <motion.aside
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        style={
          isFullscreen 
            ? undefined 
            : { width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${width}px` : undefined }
        }
        className={`flex flex-col bg-black/95 shadow-2xl transform-gpu will-change-transform ${
          isFullscreen 
            ? 'fixed inset-0 w-screen h-screen z-50' 
            : 'fixed top-12 bottom-0 inset-x-0 z-40 lg:relative lg:top-auto lg:bottom-auto lg:inset-auto lg:z-30 lg:h-full lg:flex-shrink-0 lg:border-l lg:border-white/15'
        } ${!isResizing ? 'transition-[width] duration-150 ease-out' : ''}`}
      >
        {/* Drag handle for resizing (Desktop only) */}
        {!isFullscreen && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
            }}
            onDoubleClick={() => {
              setWidth(Math.min(800, Math.max(480, Math.floor(window.innerWidth * 0.45))));
            }}
            className="hidden lg:flex absolute -left-1.5 top-0 bottom-0 w-3 z-40 cursor-ew-resize items-center justify-center group hover:bg-banan-primary/20 transition-colors"
            title="Glisser pour redimensionner (Double-clic pour réinitialiser)"
          >
            <div className={`p-0.5 rounded transition-all ${
              isResizing 
                ? 'bg-banan-primary text-black' 
                : 'bg-black/80 border border-white/20 text-white/40 group-hover:border-banan-primary group-hover:text-banan-primary'
            }`}>
              <GripVertical className="w-2.5 h-3" />
            </div>
          </div>
        )}
        {/* Top Control Bar */}
        <header className="h-12 px-4 border-b border-white/10 bg-white/[0.03] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 truncate">
            <div className="p-1 rounded bg-banan-primary/10 text-banan-primary border border-banan-primary/30">
              <Gamepad2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-wider truncate font-mono">
              {previewApp.title || 'Aperçu Sandbox'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Viewport switch */}
            <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded p-0.5 mr-1">
              <button
                onClick={() => setViewportMode('desktop')}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  viewportMode === 'desktop' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'
                }`}
                title="Format Bureau (100%)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewportMode('mobile')}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  viewportMode === 'mobile' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'
                }`}
                title="Format Mobile (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reload button */}
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Recharger le jeu (Reset)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Download button */}
            <button
              onClick={handleDownload}
              className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Télécharger le fichier .html"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen toggle (Desktop only, since mobile is always fullscreen) */}
            <button
              onClick={() => setIsFullscreen((fs) => !fs)}
              className="hidden lg:block p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-red-500/20 text-white/70 hover:text-red-400 transition-colors ml-1 cursor-pointer"
              title="Fermer le volet sandbox"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Iframe Viewport Area */}
        <div className="flex-1 bg-[#05070a] p-2 flex items-center justify-center overflow-hidden relative">
          <div
            className={`h-full transition-all duration-300 rounded-lg overflow-hidden border border-white/10 bg-black shadow-inner flex flex-col ${
              viewportMode === 'mobile' ? 'w-[375px] max-w-full' : 'w-full'
            }`}
          >
            <iframe
              key={reloadKey}
              sandbox="allow-scripts allow-modals allow-forms"
              srcDoc={previewApp.htmlCode}
              title={previewApp.title}
              className="w-full h-full border-0 bg-black"
            />
          </div>
        </div>

        {/* Footer Status Bar */}
        <footer className="h-7 px-3 border-t border-white/10 bg-black/60 flex items-center justify-between text-[10px] text-white/50 font-mono flex-shrink-0">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3 h-3" />
            <span>SANDBOX SÉCURISÉE ISOLÉE</span>
          </div>
          <div>
            <span>{viewportMode === 'desktop' ? 'VUE BUREAU (100%)' : 'VUE MOBILE (375px)'}</span>
          </div>
        </footer>
      </motion.aside>
    </AnimatePresence>
  );
}
