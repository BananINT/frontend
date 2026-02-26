import { useState, useEffect } from 'react';
import { getCurrentTheme, setTheme as setThemeUtil, addThemeListener } from '../lib/theme';
import type { Theme } from '../lib/theme';

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(getCurrentTheme());

    useEffect(() => {
        // Listen for external changes (e.g., from the header)
        const unsubscribe = addThemeListener((newTheme: Theme) => {
            setThemeState(newTheme);
        });
        return unsubscribe;
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeUtil(newTheme);
        setThemeState(newTheme);
    };

    return { theme, setTheme };
}
