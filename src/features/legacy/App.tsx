import { useState } from 'react';
import { Banana, Trophy, Gamepad2, Sparkles, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

type Page = 'home' | 'clicker';

interface ClickerState {
    bananas: number;
    bananasPerClick: number;
    totalClicks: number;
}

interface LeaderboardEntry {
    name: string;
    score: number;
    date: string;
}

const STORAGE_PREFIX = 'bananint-legacy:';

const legacyStorage = {
    get(key: string): string | null {
        return localStorage.getItem(STORAGE_PREFIX + key);
    },
    set(key: string, value: string) {
        localStorage.setItem(STORAGE_PREFIX + key, value);
    },
    remove(key: string) {
        localStorage.removeItem(STORAGE_PREFIX + key);
    },
};

export default function LegacyApp() {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [clickerState, setClickerState] = useState<ClickerState>(() => {
        const saved = legacyStorage.get('clicker-state');
        return saved ? JSON.parse(saved) : { bananas: 0, bananasPerClick: 1, totalClicks: 0 };
    });
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
        const saved = legacyStorage.get('leaderboard');
        return saved ? JSON.parse(saved) : [];
    });
    const [playerName, setPlayerName] = useState(() => legacyStorage.get('player-name') ?? '');
    const [clickAnimation, setClickAnimation] = useState(false);

    const saveGameData = (state: ClickerState) => {
        legacyStorage.set('clicker-state', JSON.stringify(state));
    };

    const handleBananaClick = () => {
        const newState = {
            ...clickerState,
            bananas: clickerState.bananas + clickerState.bananasPerClick,
            totalClicks: clickerState.totalClicks + 1,
        };
        setClickerState(newState);
        saveGameData(newState);
        setClickAnimation(true);
        setTimeout(() => setClickAnimation(false), 200);
    };

    const buyUpgrade = (cost: number, multiplier: number) => {
        if (clickerState.bananas >= cost) {
            const newState = {
                ...clickerState,
                bananas: clickerState.bananas - cost,
                bananasPerClick: clickerState.bananasPerClick + multiplier,
            };
            setClickerState(newState);
            saveGameData(newState);
        }
    };

    const submitScore = () => {
        if (!playerName.trim()) {
            alert('Entre ton nom pour soumettre ton score !');
            return;
        }

        legacyStorage.set('player-name', playerName);

        const newEntry: LeaderboardEntry = {
            name: playerName,
            score: clickerState.bananas,
            date: new Date().toISOString(),
        };

        const updatedLeaderboard = [...leaderboard, newEntry]
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        setLeaderboard(updatedLeaderboard);
        legacyStorage.set('leaderboard', JSON.stringify(updatedLeaderboard));

        alert('Score soumis avec succès ! 🍌');
    };

    const resetGame = () => {
        if (confirm('Veux-tu vraiment recommencer à zéro ? 🍌')) {
            const newState = { bananas: 0, bananasPerClick: 1, totalClicks: 0 };
            setClickerState(newState);
            legacyStorage.remove('clicker-state');
        }
    };

    if (currentPage === 'home') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-300 to-orange-400 font-sans">
                <header className="bg-yellow-500 shadow-lg">
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Banana className="w-12 h-12 text-yellow-900" />
                                <div>
                                    <h1 className="text-4xl font-bold text-yellow-900">BANANINT</h1>
                                    <p className="text-sm text-yellow-800">Association de Télécom SudParis</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setCurrentPage('clicker')}
                                className="bg-yellow-900 text-yellow-100 px-6 py-3 rounded-full font-bold hover:bg-yellow-800 transition-all transform hover:scale-105 flex items-center gap-2"
                            >
                                <Gamepad2 className="w-5 h-5" />
                                Banana Clicker
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                <section className="container mx-auto px-4 py-16 text-center">
                    <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-12 max-w-4xl mx-auto">
                        <div className="text-8xl mb-6 animate-bounce">🍌</div>
                        <h2 className="text-5xl font-bold text-yellow-900 mb-4">
                            Bienvenue chez Bananint !
                        </h2>
                        <p className="text-xl text-gray-700 mb-8">
                            L'association la plus fun de l'INT. Du fun, des events, des jeux et... des bananes ! 🎉
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <div className="bg-yellow-100 px-6 py-3 rounded-full flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-600" />
                                <span className="font-semibold text-yellow-900">100% Fun</span>
                            </div>
                            <div className="bg-yellow-100 px-6 py-3 rounded-full flex items-center gap-2">
                                <Users className="w-5 h-5 text-yellow-600" />
                                <span className="font-semibold text-yellow-900">100% Convivial</span>
                            </div>
                            <div className="bg-yellow-100 px-6 py-3 rounded-full flex items-center gap-2">
                                <Banana className="w-5 h-5 text-yellow-600" />
                                <span className="font-semibold text-yellow-900">100% Bananes</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-16">
                    <h3 className="text-4xl font-bold text-center text-yellow-900 mb-12">
                        Nos Events 🎊
                    </h3>
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all">
                            <div className="text-5xl mb-4 text-center">🎮</div>
                            <h4 className="text-2xl font-bold text-yellow-900 mb-3">WEB Week-end Banane</h4>
                            <p className="text-gray-700">
                                Un week-end de développement web délirant où on code des trucs bananes et on mange des bananes !
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all">
                            <div className="text-5xl mb-4 text-center">🎯</div>
                            <h4 className="text-2xl font-bold text-yellow-900 mb-3">Tournois Jeux</h4>
                            <p className="text-gray-700">
                                Mario Kart, Smash Bros, et plein d'autres jeux ! Viens affronter tes potes dans une ambiance banane.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all">
                            <div className="text-5xl mb-4 text-center">🍌</div>
                            <h4 className="text-2xl font-bold text-yellow-900 mb-3">Import de Bananes</h4>
                            <p className="text-gray-700">
                                On importe des bananes pour toute l'école ! Distribution gratuite et bonheur garanti.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-16 mb-16">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl shadow-2xl p-12 max-w-4xl mx-auto">
                        <h3 className="text-4xl font-bold text-center text-white mb-12">
                            Nos Stats Bananes 📊
                        </h3>
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            <div>
                                <div className="text-5xl font-bold text-white mb-2">500+</div>
                                <div className="text-xl text-yellow-100">Bananes distribuées</div>
                            </div>
                            <div>
                                <div className="text-5xl font-bold text-white mb-2">50+</div>
                                <div className="text-xl text-yellow-100">Membres actifs</div>
                            </div>
                            <div>
                                <div className="text-5xl font-bold text-white mb-2">10+</div>
                                <div className="text-xl text-yellow-100">Events par an</div>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="bg-yellow-900 text-yellow-100 py-8">
                    <div className="container mx-auto px-4 text-center space-y-2">
                        <p className="text-lg">Rejoins-nous sur Discord et Instagram !</p>
                        <p>🍌 Bananint - L'asso qui a la banane 🍌</p>
                        <Link to="/" className="inline-block text-xs text-yellow-100/50 hover:text-yellow-100 transition-colors pt-2">
                            ← Retour au site actuel
                        </Link>
                    </div>
                </footer>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-300 to-yellow-500 font-sans">
            <header className="bg-yellow-900 shadow-lg">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setCurrentPage('home')}
                            className="text-yellow-100 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <ArrowRight className="w-5 h-5 rotate-180" />
                            Retour
                        </button>
                        <h1 className="text-3xl font-bold text-yellow-100">🍌 Banana Clicker</h1>
                        <button
                            onClick={resetGame}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-3xl shadow-2xl p-8">
                        <div className="text-center mb-8">
                            <div className="text-6xl font-bold text-yellow-900 mb-2">
                                {clickerState.bananas.toLocaleString()} 🍌
                            </div>
                            <div className="text-gray-600">
                                {clickerState.bananasPerClick} banane(s) par clic
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                Total: {clickerState.totalClicks} clics
                            </div>
                        </div>

                        <div className="flex justify-center mb-8">
                            <button
                                onClick={handleBananaClick}
                                className={`text-9xl hover:scale-110 active:scale-95 transition-transform cursor-pointer ${clickAnimation ? 'scale-125' : ''
                                    }`}
                                aria-label="Cliquer sur la banane"
                            >
                                🍌
                            </button>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-yellow-900 mb-4">Améliorations</h3>

                            <button
                                onClick={() => buyUpgrade(10, 1)}
                                disabled={clickerState.bananas < 10}
                                className="w-full bg-yellow-500 text-yellow-900 p-4 rounded-xl font-bold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <div className="flex justify-between items-center">
                                    <span>+1 par clic</span>
                                    <span>10 🍌</span>
                                </div>
                            </button>

                            <button
                                onClick={() => buyUpgrade(50, 5)}
                                disabled={clickerState.bananas < 50}
                                className="w-full bg-orange-500 text-white p-4 rounded-xl font-bold hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <div className="flex justify-between items-center">
                                    <span>+5 par clic</span>
                                    <span>50 🍌</span>
                                </div>
                            </button>

                            <button
                                onClick={() => buyUpgrade(200, 25)}
                                disabled={clickerState.bananas < 200}
                                className="w-full bg-red-500 text-white p-4 rounded-xl font-bold hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <div className="flex justify-between items-center">
                                    <span>+25 par clic</span>
                                    <span>200 🍌</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-2xl p-8">
                        <h3 className="text-3xl font-bold text-yellow-900 mb-6 flex items-center gap-2">
                            <Trophy className="w-8 h-8" />
                            Classement
                        </h3>

                        <div className="mb-6 space-y-3">
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                placeholder="Ton pseudo"
                                className="w-full px-4 py-3 border-2 border-yellow-300 rounded-xl focus:outline-none focus:border-yellow-500"
                                maxLength={20}
                            />
                            <button
                                onClick={submitScore}
                                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105"
                            >
                                Soumettre mon score
                            </button>
                        </div>

                        <div className="space-y-3">
                            {leaderboard.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">
                                    Pas encore de scores. Sois le premier ! 🍌
                                </p>
                            ) : (
                                leaderboard.map((entry, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-xl flex items-center justify-between ${index === 0
                                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-300'
                                                : index === 1
                                                    ? 'bg-gradient-to-r from-gray-300 to-gray-200'
                                                    : index === 2
                                                        ? 'bg-gradient-to-r from-orange-300 to-orange-200'
                                                        : 'bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl font-bold">
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                                            </span>
                                            <span className="font-semibold">{entry.name}</span>
                                        </div>
                                        <span className="text-xl font-bold">
                                            {entry.score.toLocaleString()} 🍌
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>

                        <p className="text-sm text-gray-500 mt-6 text-center">
                            Le classement est stocké localement dans ce navigateur 🌍
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
