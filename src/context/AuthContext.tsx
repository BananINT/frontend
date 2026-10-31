import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import keycloak from '@app/lib/keycloak';
import { setTheme } from '@app/lib/theme';

interface AuthContextType {
  authenticated: boolean;
  username: string | null;
  token: string | null;
  userId: string | null;
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
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isRun) return;
    isRun = true;
    
    let refreshInterval: ReturnType<typeof setInterval> | undefined;

    const initKeycloak = async () => {
      // Prevent infinite iframe recursion if check-sso hits the Vite fallback proxy
      if (window !== window.parent) {
        setLoading(false);
        return; 
      }

      try {
        keycloak.onTokenExpired = () => {
          keycloak.updateToken(30).catch(() => {
            console.error('Failed to refresh token on expiry');
            setAuthenticated(false);
            setToken(null);
            setTheme('default');
          });
        };

        keycloak.onAuthRefreshSuccess = () => {
          setToken(keycloak.token || null);
        };

        const initPromise = keycloak.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          pkceMethod: 'S256',
          checkLoginIframe: false,
        });

        // keycloak.init() never settles if the silent-check-sso iframe can't
        // post back (e.g. misconfigured redirect URI), so bail out instead of
        // leaving the app stuck on the auth spinner forever.
        const timeoutPromise = new Promise<boolean>((_, reject) => {
          setTimeout(() => reject(new Error('Keycloak init timed out')), 8000);
        });

        const auth = await Promise.race([initPromise, timeoutPromise]);

        setAuthenticated(auth);
        if (auth) {
          setToken(keycloak.token || null);
          setUserId(keycloak.subject || null);
          
          let displayName = keycloak.tokenParsed?.name;
          if (!displayName && (keycloak.tokenParsed?.given_name || keycloak.tokenParsed?.family_name)) {
            displayName = `${keycloak.tokenParsed?.given_name || ''} ${keycloak.tokenParsed?.family_name || ''}`.trim();
          }
          if (!displayName) {
            displayName = keycloak.tokenParsed?.preferred_username;
          }
          
          setUsername(displayName || null);

          // Proactively refresh token every minute
          refreshInterval = setInterval(() => {
            keycloak.updateToken(70).then((refreshed) => {
              if (refreshed) {
                setToken(keycloak.token || null);
              }
            }).catch((err) => {
              console.error("Token refresh failed", err);
            });
          }, 60000);
        }
      } catch (error) {
        console.error('Failed to initialize Keycloak', error);
      } finally {
        setLoading(false);
      }
    };

    initKeycloak();
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);

  const login = useCallback(() => { keycloak.login(); }, []);
  const logout = useCallback(() => {
    setTheme('default');
    keycloak.logout();
  }, []);

  const value = useMemo(
    () => ({ authenticated, username, userId, token, login, logout, loading }),
    [authenticated, username, userId, token, login, logout, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
