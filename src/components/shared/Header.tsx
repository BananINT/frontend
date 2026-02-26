import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Banana, Home, Calendar, Menu, X, LogIn, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@app/lib/utils';
import { useAuth } from '@app/context/AuthContext';
import { THEMES, setTheme, getCurrentTheme } from '@app/lib/theme';
import { Palette } from 'lucide-react';

export default function Header() {
    const { authenticated, username, login, logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [theme, setThemeState] = useState(getCurrentTheme());

    const cycleTheme = () => {
        const currentIndex = THEMES.indexOf(theme);
        const nextIndex = (currentIndex + 1) % THEMES.length;
        const nextTheme = THEMES[nextIndex];
        setTheme(nextTheme);
        setThemeState(nextTheme);
    };

    const navItems = [
        { label: 'Accueil', path: '/', icon: Home },
        { label: 'Clicker', path: '/clicker', icon: Banana },
        { label: 'Bananée', path: '/bananee', icon: Calendar },
    ];

    return (
        <header className="sticky top-0 z-50 w-full text-banan-background border-b border-banan-background">
            <div className="container z-50 bg-banan-primary flex h-12 items-center justify-between px-4 max-w-[1920px] mx-auto relative">
                <Link to="/" className="flex items-center gap-2 font-black text-xl font-sans uppercase tracking-tighter hover:opacity-80 transition-opacity text-banan-background">
                    <span>BananINT</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all duration-200 border-b-2 border-transparent hover:border-black",
                                    location.pathname === item.path ? "border-black" : "opacity-60 hover:opacity-100"
                                )}
                            >
                                <Icon className="h-3 w-3" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                    
                    {/* Theme Switcher */}
                    <button 
                        onClick={cycleTheme}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all duration-200 border-b-2 border-transparent hover:border-black opacity-60 hover:opacity-100"
                        title={`Cycle Theme (Current: ${theme})`}
                    >
                        <Palette className="h-3 w-3" />
                        <span>Style: {theme}</span>
                    </button>

                    {/* Auth Toggle */}
                    {authenticated ? (
                        <button 
                            onClick={() => logout()}
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all duration-200 border-b-2 border-transparent hover:border-black opacity-60 hover:opacity-100"
                        >
                            <LogOut className="h-3 w-3" />
                            <span>Déconnexion ({username})</span>
                        </button>
                    ) : (
                        <button 
                            onClick={() => login()}
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all duration-200 border-b-2 border-transparent hover:border-black opacity-60 hover:opacity-100"
                        >
                            <LogIn className="h-3 w-3" />
                            <span>Connexion</span>
                        </button>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 -mr-2 text-black hover:opacity-70 transition-opacity"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ y: "-100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute top-0 left-0 w-full bg-banan-primary border-b border-black md:hidden flex flex-col pt-16 pb-8 px-4 shadow-xl"
                    >
                        <nav className="flex flex-col gap-4">
                            {navItems.map((item, index) => {
                                const Icon = item.icon;

                                return (
                                    <motion.div
                                        key={item.path}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 + index * 0.1 }}
                                    >
                                        <Link
                                            to={item.path}
                                            className="flex items-center gap-4 text-xl font-black uppercase tracking-tighter py-2 border-b border-black/10 text-black hover:opacity-70 transition-opacity"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span>{item.label}</span>
                                        </Link>
                                    </motion.div>
                                );
                            })}

                            {/* Mobile Auth Toggle */}
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 + navItems.length * 0.1 }}
                            >
                                {authenticated ? (
                                    <button
                                        onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                        className="flex items-center gap-4 text-xl font-black uppercase tracking-tighter py-3 border-b border-black/10 text-black hover:opacity-70 transition-opacity w-full text-left"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        <span>Déconnexion</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => { login(); setIsMobileMenuOpen(false); }}
                                        className="flex items-center gap-4 text-xl font-black uppercase tracking-tighter py-3 border-b border-black/10 text-black hover:opacity-70 transition-opacity w-full text-left"
                                    >
                                        <LogIn className="h-5 w-5" />
                                        <span>Connexion</span>
                                    </button>
                                )}
                            </motion.div>
                        </nav>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            transition={{ delay: 0.4 }}
                            className="mt-8 text-[10px] font-mono uppercase text-center"
                        >
                            System Operational
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
