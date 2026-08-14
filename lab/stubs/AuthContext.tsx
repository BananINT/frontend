/* eslint-disable react-refresh/only-export-components -- lab stub, not app code */
import type { ReactNode } from 'react';

export const useAuth = () => ({
    authenticated: true,
    username: 'lab',
    token: 'lab',
    userId: 'lab',
    loading: false,
    login: () => {},
    logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => <>{children}</>;
