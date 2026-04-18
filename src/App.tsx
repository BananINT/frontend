
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@app/context/AuthContext';
import RootLayout from '@app/layouts/RootLayout';
import GameLayout from '@app/layouts/GameLayout';
import { lazy } from 'react';

import HomePage from '@app/features/home/HomePage';

const ClickerPage = lazy(() => import('@app/features/clicker/ClickerPage'));
const CasinoPage = lazy(() => import('@app/features/casino/CasinoPage'));
const LoginPage = lazy(() => import('@app/features/auth/LoginPage'));
const EventsPage = lazy(() => import('@app/features/events/EventsPage'));
//@ts-ignore
const BananeeApp = lazy(() => import('@app/features/bananee/App'));

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
            </Route>
            <Route 
              path="/bananee" 
              element={
                <BananeeApp />
              } 
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
