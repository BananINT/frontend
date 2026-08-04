import { Outlet } from 'react-router';
import { GameProvider } from '@app/context/GameContext';
import ProtectedRoute from '@app/components/ProtectedRoute';

export default function GameLayout() {
    return (
        <ProtectedRoute>
            <GameProvider>
                <Outlet />
            </GameProvider>
        </ProtectedRoute>
    );
}
