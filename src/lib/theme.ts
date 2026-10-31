export type Theme = 'default' | 'indigo' | 'matrix' | 'solaris' | 'rainbow' | 'golden';

export const THEMES: Theme[] = ['default', 'indigo', 'matrix', 'solaris', 'rainbow', 'golden'];

// We use an EventTarget to allow components to listen for theme changes
const themeEvents = new EventTarget();

export function setTheme(theme: Theme) {
    if (typeof document === 'undefined') return;
    
    // Set the data-theme attribute on the root element
    document.documentElement.setAttribute('data-theme', theme);
    
    // Save the preference to local storage
    localStorage.setItem('banan-theme', theme);
    
    // Notify subscribers
    themeEvents.dispatchEvent(new CustomEvent('themechange', { detail: theme }));

    // Trigger a resize event to force UI objects (like Three.js) to refresh
    window.dispatchEvent(new Event('resize'));
}

export function getCurrentTheme(): Theme {
    if (typeof localStorage === 'undefined') return 'default';
    
    const saved = localStorage.getItem('banan-theme') as Theme;
    return THEMES.includes(saved) ? saved : 'default';
}

/**
 * Add a listener for theme changes
 */
export function addThemeListener(callback: (theme: Theme) => void) {
    const handler = (e: Event) => callback((e as CustomEvent).detail);
    themeEvents.addEventListener('themechange', handler);
    return () => themeEvents.removeEventListener('themechange', handler);
}
