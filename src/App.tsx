
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { AuthProvider } from '@app/context/AuthContext';
import RootLayout from '@app/layouts/RootLayout';
import GameLayout from '@app/layouts/GameLayout';
import { lazy } from 'react';

import HomePage from '@app/features/home/HomePage';

const ClickerPage = lazy(() => import('@app/features/clicker/ClickerPage'));
const CasinoPage = lazy(() => import('@app/features/casino/CasinoPage'));
const SlotsPage = lazy(() => import('@app/features/casino/pages/SlotsPage'));
const RoulettePage = lazy(() => import('@app/features/casino/pages/RoulettePage'));
const LotteryPage = lazy(() => import('@app/features/casino/pages/LotteryPage'));
// Casino Potassium — tables added in the second wave.
const CrashPage = lazy(() => import('@app/features/casino/pages/CrashPage'));
const MinesPage = lazy(() => import('@app/features/casino/pages/MinesPage'));
const PlinkoPage = lazy(() => import('@app/features/casino/pages/PlinkoPage'));
const BlackjackPage = lazy(() => import('@app/features/casino/pages/BlackjackPage'));
const DicePage = lazy(() => import('@app/features/casino/pages/DicePage'));
const WheelPage = lazy(() => import('@app/features/casino/pages/WheelPage'));
const FairnessPage = lazy(() => import('@app/features/casino/pages/FairnessPage'));
const LoginPage = lazy(() => import('@app/features/auth/LoginPage'));
const EventsPage = lazy(() => import('@app/features/events/EventsPage'));
//@ts-expect-error - External feature might have type issues during lazy load
const BananeeApp = lazy(() => import('@app/features/bananee/App'));
const ClanPage = lazy(() => import('@app/features/clans/ClanPage'));
const ClanOpsPage = lazy(() => import('@app/features/clans/ClanOpsPage'));
const CyberLabPage = lazy(() => import('@app/features/lab/CyberLabPage'));
// Nostalgia easter egg: original pre-BananINT clicker prototype, intentionally
// disconnected from the real backend economy (own localStorage state only).
const LegacyApp = lazy(() => import('@app/features/legacy/App'));
const BlogListPage = lazy(() => import('@app/features/blog/BlogListPage'));
const BlogPostPage = lazy(() => import('@app/features/blog/BlogPostPage'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/timeline" element={<EventsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<GameLayout />}>
              <Route path="/clicker" element={<ClickerPage />} />
              <Route path="/casino" element={<CasinoPage />} />
              <Route path="/casino/slots" element={<SlotsPage />} />
              <Route path="/casino/roulette" element={<RoulettePage />} />
              <Route path="/casino/lottery" element={<LotteryPage />} />
              <Route path="/casino/crash" element={<CrashPage />} />
              <Route path="/casino/mines" element={<MinesPage />} />
              <Route path="/casino/plinko" element={<PlinkoPage />} />
              <Route path="/casino/blackjack" element={<BlackjackPage />} />
              <Route path="/casino/dice" element={<DicePage />} />
              <Route path="/casino/wheel" element={<WheelPage />} />
              <Route path="/casino/fairness" element={<FairnessPage />} />
              <Route path="/clan" element={<ClanPage />} />
              <Route path="/clan/ops" element={<ClanOpsPage />} />
              <Route path="/lab" element={<CyberLabPage />} />
            </Route>
            <Route
              path="/bananee"
              element={
                <BananeeApp />
              }
            />
            <Route path="/blog" element={<BlogListPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/legacy" element={<LegacyApp />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
