
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from '@/context/GameContext';
import RootLayout from '@/layouts/RootLayout';
import HomePage from '@/features/home/HomePage';
import ClickerPage from '@/features/clicker/ClickerPage';

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/clicker" element={<ClickerPage />} />
          </Route>
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;
