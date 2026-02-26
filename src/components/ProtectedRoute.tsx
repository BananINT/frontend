import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@app/context/AuthContext';
import BananLoader from '@app/components/shared/BananLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { authenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <BananLoader message="AUTHENTIFICATION..." />;
  }

  if (!authenticated) {
    // Redirect to login page and store the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
