import Modal from '@app/components/shared/Modal';
import { THEMES, setTheme, type Theme } from '@app/lib/theme';
import { useGame } from '@app/context/GameContext';
import { Palette, Lock, Check, Banana } from 'lucide-react';
import { formatNumber } from '@app/utils/format';

interface ThemeShopModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const THEME_DATA: Record<Theme, { name: string; cost: number; description: string }> = {
    default: { name: 'Classique', cost: 0, description: 'Le look original BananINT.' },
    indigo: { name: 'Indigo', cost: 100000, description: 'Un thème sombre et élégant aux accents neon.' },
    matrix: { name: 'Matrix', cost: 1000000, description: 'Pour les vrais néo-bananiers.' },
    solaris: { name: 'Solaris', cost: 10000000, description: 'Inspiré par la chaleur du soleil.' },
    rainbow: { name: 'Aura', cost: 100000000, description: 'Toutes les couleurs du potassium.' },
    golden: { name: 'Doré', cost: 1000000000, description: 'Le luxe ultime pour les rois de la banane.' }
};

export default function ThemeShopModal({ isOpen, onClose }: ThemeShopModalProps) {
    const { gameState, buyTheme } = useGame();
    const { bananas, ownedThemes } = gameState;

    const handleAction = async (themeId: Theme) => {
        if (ownedThemes.includes(themeId)) {
            setTheme(themeId);
        } else {
            if (bananas >= THEME_DATA[themeId].cost) {
                await buyTheme(themeId);
            }
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="BOUTIQUE DE STYLES"
        >
            <div className="grid grid-cols-1 gap-4">
                {THEMES.map((themeId) => {
                    const data = THEME_DATA[themeId];
                    const isOwned = ownedThemes.includes(themeId);
                    const canAfford = bananas >= data.cost;

                    return (
                        <div 
                            key={themeId}
                            className={`p-4 border-2 flex items-center justify-between transition-all ${
                                isOwned 
                                ? 'border-banan-primary bg-banan-primary/5' 
                                : 'border-white/10 bg-white/5 hover:border-white/20'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 ${isOwned ? 'bg-banan-primary text-black' : 'bg-white/10 text-white/40'}`}>
                                    <Palette className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-lg uppercase tracking-tight">{data.name}</h4>
                                        {isOwned && <Check className="w-4 h-4 text-banan-primary" />}
                                    </div>
                                    <p className="text-white/60 text-xs italic">{data.description}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleAction(themeId)}
                                disabled={!isOwned && !canAfford}
                                className={`px-6 py-2 font-black text-xs uppercase tracking-widest transition-all ${
                                    isOwned
                                    ? 'bg-white/10 text-white hover:bg-white/20'
                                    : canAfford
                                        ? 'bg-banan-primary text-black hover:scale-105 active:scale-95'
                                        : 'bg-white/5 text-white/20 cursor-not-allowed'
                                }`}
                            >
                                {isOwned ? (
                                    "Appliquer"
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {!canAfford && <Lock className="w-3 h-3" />}
                                        <span>{formatNumber(data.cost)} <Banana className="inline-block w-3 h-3 align-baseline text-banan-primary" /></span>
                                    </div>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-8 p-4 bg-banan-primary/10 border border-banan-primary/20 text-center">
                <p className="text-banan-primary text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-1">
                    Vos bananes: {formatNumber(bananas)} <Banana className="w-3 h-3" />
                </p>
            </div>
        </Modal>
    );
}
