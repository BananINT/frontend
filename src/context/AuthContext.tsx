import React, { createContext, useContext, useEffect, useState } from 'react';
import keycloak from '@app/lib/keycloak';

interface AuthContextType {
  authenticated: boolean;
  username: string | null;
  token: string | null;
  login: () => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let isRun = false;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isRun) return;
    isRun = true;
    
    const initKeycloak = async () => {
      // Prevent infinite iframe recursion if check-sso hits the Vite fallback proxy
      if (window !== window.parent) {
        return; 
      }

      try {
        const authenticated = await keycloak.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          pkceMethod: 'S256',
        });

        setAuthenticated(authenticated);
        if (authenticated) {
          setToken(keycloak.token || null);
          
          let displayName = keycloak.tokenParsed?.name;
          if (!displayName && (keycloak.tokenParsed?.given_name || keycloak.tokenParsed?.family_name)) {
            displayName = `${keycloak.tokenParsed?.given_name || ''} ${keycloak.tokenParsed?.family_name || ''}`.trim();
          }
          if (!displayName) {
            displayName = keycloak.tokenParsed?.preferred_username;
          }
          
          setUsername(displayName || null);
        }
      } catch (error) {
        console.error('Failed to initialize Keycloak', error);
      } finally {
        setLoading(false);
      }
    };

    initKeycloak();
    
    // Note: Do not reset isRun = false here because Strict Mode unmounts and remounts instantly
  }, []);

  const login = () => keycloak.login();
  const logout = () => keycloak.logout();

  return (
    <AuthContext.Provider value={{ authenticated, username, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
