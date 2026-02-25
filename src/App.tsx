
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from '@/context/GameContext';
import { AuthProvider } from '@/context/AuthContext';
import RootLayout from '@/layouts/RootLayout';
import HomePage from '@/features/home/HomePage';
import ClickerPage from '@/features/clicker/ClickerPage';
import LoginPage from '@/features/auth/LoginPage';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Router>
          <Routes>
            <Route element={<RootLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/clicker" 
                element={
                  <ProtectedRoute>
                    <ClickerPage />
                  </ProtectedRoute>
                } 
              />
            </Route>
          </Routes>
        </Router>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
