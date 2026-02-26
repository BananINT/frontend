
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from '@app/context/GameContext';
import { AuthProvider } from '@app/context/AuthContext';
import RootLayout from '@app/layouts/RootLayout';
import ProtectedRoute from '@app/components/ProtectedRoute';
import { lazy } from 'react';

import HomePage from '@app/features/home/HomePage';

const ClickerPage = lazy(() => import('@app/features/clicker/ClickerPage'));
const LoginPage = lazy(() => import('@app/features/auth/LoginPage'));
const BananeeApp = lazy(() => import('@app/features/bananee/App'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/clicker" 
              element={
                <ProtectedRoute>
                  <GameProvider>
                    <ClickerPage />
                  </GameProvider>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bananee" 
              element={<BananeeApp />} 
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
