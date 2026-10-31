import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import {
    Banana,
    Home,
    Calendar,
    LogIn,
    LogOut,
    Clock,
    Dices,
    Shield,
    Cpu,
    Compass,
    Gamepad2,
    ChevronDown,
    BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@app/lib/utils';
import { useAuth } from '@app/context/AuthContext';

export default function Header() {
    const { authenticated, username, login, logout } = useAuth();
    const location = useLocation();

    // Little popup dropdown states
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isGamesOpen, setIsGamesOpen] = useState(false);

    const navRef = useRef<HTMLDivElement>(null);
    const gamesRef = useRef<HTMLDivElement>(null);

    const mainNavItems = [
        { label: 'Accueil', path: '/', icon: Home },
        { label: 'Timeline', path: '/timeline', icon: Clock },
        { label: 'Bananée', path: '/bananee', icon: Calendar },
        { label: 'Blog', path: '/blog', icon: BookOpen },
    ];

    const gameNavItems = [
        { label: 'Clicker', path: '/clicker', icon: Banana, tag: 'BPC' },
        { label: 'Casino', path: '/casino', icon: Dices, tag: 'GAMES' },
        { label: 'Clan', path: '/clan', icon: Shield, tag: 'OSINT' },
        { label: 'CyberLab', path: '/lab', icon: Cpu, tag: 'IA' },
    ];

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setIsNavOpen(false);
            }
            if (gamesRef.current && !gamesRef.current.contains(event.target as Node)) {
                setIsGamesOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close on Escape or browser navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsNavOpen(false);
                setIsGamesOpen(false);
            }
        };
        const handlePopState = () => {
            setIsNavOpen(false);
            setIsGamesOpen(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    const closeAll = () => {
        setIsNavOpen(false);
        setIsGamesOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 w-full text-banan-background border-b border-banan-background select-none">
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-2 focus:z-[100] focus:rounded-full focus:border-2 focus:border-banan-background focus:bg-banan-primary focus:px-5 focus:py-2 focus:font-mono focus:text-sm focus:font-bold focus:uppercase focus:tracking-widest focus:text-banan-background focus:outline-none focus:ring-2 focus:ring-white"
            >
                Aller au contenu
            </a>
            <div className="container z-50 bg-banan-primary flex h-12 items-center justify-between px-2 min-[375px]:px-3 sm:px-4 max-w-[1920px] mx-auto relative min-w-0">
                {/* ============================================================== */}
                {/* WIDE SCREENS (xl: >= 1280px): Full horizontal desktop bar      */}
                {/* ============================================================== */}
                <div className="hidden xl:flex items-center justify-between w-full min-w-0">
                    <Link
                        to="/"
                        className="flex items-center gap-2 font-black text-xl font-sans uppercase tracking-tighter hover:opacity-80 transition-opacity text-banan-background shrink-0"
                    >
                        <span>BananINT</span>
                    </Link>

                    <nav className="flex items-center gap-4 2xl:gap-6 min-w-0">
                        {/* Main Platform Links */}
                        <div className="flex items-center gap-4 2xl:gap-6 border-r border-banan-background/20 pr-4 2xl:pr-6 shrink-0">
                            {mainNavItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={cn(
                                            "flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all duration-200 border-b-2 border-transparent hover:border-black whitespace-nowrap",
                                            isActive ? "border-black" : "opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <Icon className="h-3 w-3 shrink-0" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Game/Operation Links */}
                        <div className="flex items-center gap-4 2xl:gap-6 shrink-0">
                            {gameNavItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={cn(
                                            "flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all duration-200 border-b-2 border-transparent hover:border-black whitespace-nowrap",
                                            isActive ? "border-black" : "opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <Icon className="h-3 w-3 shrink-0" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Desktop Auth */}
                        <div className="shrink-0 pl-2">
                            {authenticated ? (
                                <button
                                    onClick={() => logout()}
                                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all duration-200 border-b-2 border-transparent hover:border-black opacity-60 hover:opacity-100 shrink-0 cursor-pointer"
                                    title={`Déconnexion (${username})`}
                                >
                                    <LogOut className="h-3 w-3 shrink-0" />
                                    <span className="flex items-center">
                                        Déconnexion&nbsp;(
                                        <span className="max-w-[120px] 2xl:max-w-[180px] truncate inline-block align-bottom font-mono">
                                            {username}
                                        </span>
                                        )
                                    </span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => login()}
                                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all duration-200 border-b-2 border-transparent hover:border-black opacity-60 hover:opacity-100 shrink-0 cursor-pointer"
                                >
                                    <LogIn className="h-3 w-3 shrink-0" />
                                    <span>Connexion</span>
                                </button>
                            )}
                        </div>
                    </nav>
                </div>

                {/* ============================================================== */}
                {/* INTERMEDIATE & MOBILE (< xl): Simple Little Popups             */}
                {/* ============================================================== */}
                <div className="flex xl:hidden items-center justify-between w-full min-w-0 gap-2">
                    {/* Left: Logo only */}
                    <Link
                        to="/"
                        onClick={closeAll}
                        className="flex items-center font-black text-lg sm:text-xl font-sans uppercase tracking-tighter hover:opacity-80 transition-opacity text-banan-background shrink-0"
                    >
                        <span>BananINT</span>
                    </Link>

                    {/* Right: Nav Popup + Games Popup + Quick Auth */}
                    <div className="flex items-center gap-1 min-[375px]:gap-2 shrink-0">
                        {/* Little Navigation Popup */}
                        <div ref={navRef} className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsNavOpen(!isNavOpen);
                                    setIsGamesOpen(false);
                                }}
                                className={cn(
                                    "flex items-center gap-1 px-1.5 min-[375px]:px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer border border-black/20 text-black hover:bg-black/10",
                                    isNavOpen && "bg-black/15 border-black"
                                )}
                                aria-expanded={isNavOpen}
                                aria-label="Menu Navigation"
                            >
                                <Compass className="h-3.5 w-3.5 shrink-0" />
                                <span className="max-[374px]:hidden">Nav</span>
                                <ChevronDown
                                    className={cn(
                                        "h-3 w-3 transition-transform duration-150",
                                        isNavOpen && "rotate-180"
                                    )}
                                />
                            </button>

                            <AnimatePresence>
                                {isNavOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                                        transition={{ duration: 0.12 }}
                                        className="absolute top-full right-0 mt-1.5 w-48 bg-[#0e0e0e] border border-black/80 rounded shadow-2xl py-1 z-50 text-white overflow-hidden"
                                    >
                                        <div className="text-[9px] font-mono uppercase tracking-widest text-white/40 px-3 py-1 border-b border-white/5">
                                            Navigation
                                        </div>
                                        {mainNavItems.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = location.pathname === item.path;
                                            return (
                                                <Link
                                                    key={item.path}
                                                    to={item.path}
                                                    onClick={() => setIsNavOpen(false)}
                                                    className={cn(
                                                        "flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                                                        isActive
                                                            ? "bg-white/15 text-white"
                                                            : "text-white/80 hover:bg-white/10 hover:text-white"
                                                    )}
                                                >
                                                    <Icon className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{item.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Little Games Popup */}
                        <div ref={gamesRef} className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsGamesOpen(!isGamesOpen);
                                    setIsNavOpen(false);
                                }}
                                className={cn(
                                    "flex items-center gap-1 px-1.5 min-[375px]:px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer border border-black/20 text-black hover:bg-black/10",
                                    isGamesOpen && "bg-black/15 border-black"
                                )}
                                aria-expanded={isGamesOpen}
                                aria-label="Menu Jeux"
                            >
                                <Gamepad2 className="h-3.5 w-3.5 shrink-0" />
                                <span className="max-[374px]:hidden">Jeux</span>
                                <ChevronDown
                                    className={cn(
                                        "h-3 w-3 transition-transform duration-150",
                                        isGamesOpen && "rotate-180"
                                    )}
                                />
                            </button>

                            <AnimatePresence>
                                {isGamesOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                                        transition={{ duration: 0.12 }}
                                        className="absolute top-full right-0 mt-1.5 w-52 bg-[#0e0e0e] border border-black/80 rounded shadow-2xl py-1 z-50 text-white overflow-hidden"
                                    >
                                        <div className="text-[9px] font-mono uppercase tracking-widest text-white/40 px-3 py-1 border-b border-white/5">
                                            Modules
                                        </div>
                                        {gameNavItems.map((item) => {
                                            const Icon = item.icon;
                                            const isActive =
                                                item.path === '/'
                                                    ? location.pathname === '/'
                                                    : location.pathname.startsWith(item.path);
                                            return (
                                                <Link
                                                    key={item.path}
                                                    to={item.path}
                                                    onClick={() => setIsGamesOpen(false)}
                                                    className={cn(
                                                        "flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                                                        isActive
                                                            ? "bg-white/15 text-white"
                                                            : "text-white/80 hover:bg-white/10 hover:text-white"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <Icon className="w-3.5 h-3.5 shrink-0" />
                                                        <span>{item.label}</span>
                                                    </div>
                                                    <span
                                                        className={cn(
                                                            "text-[9px] font-mono px-1 py-0.5 rounded",
                                                            isActive
                                                                ? "bg-white/20 text-white font-bold"
                                                                : "bg-white/10 text-white/50"
                                                        )}
                                                    >
                                                        {item.tag}
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Quick Auth */}
                        {authenticated ? (
                            <button
                                onClick={() => logout()}
                                className="flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase tracking-wider border border-black/30 rounded text-black hover:bg-black/15 transition-all shrink-0 cursor-pointer"
                                title={`Déconnexion (${username})`}
                            >
                                <LogOut className="h-3.5 w-3.5 shrink-0" />
                                <span className="max-w-[70px] sm:max-w-[110px] truncate hidden sm:inline font-mono">
                                    {username}
                                </span>
                            </button>
                        ) : (
                            <button
                                onClick={() => login()}
                                className="flex items-center gap-1 px-2 min-[375px]:px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-black text-banan-primary rounded hover:bg-black/85 transition-all shrink-0 cursor-pointer shadow-sm"
                            >
                                <LogIn className="h-3.5 w-3.5 shrink-0" />
                                <span className="hidden sm:inline">Login</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
