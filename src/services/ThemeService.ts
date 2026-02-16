const THEME_KEY = 'app-theme-preference';

export type ThemeMode = 'light' | 'dark' | 'system';

function getSystemPrefersDark(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(mode: ThemeMode) {
    const isDark = mode === 'dark' || (mode === 'system' && getSystemPrefersDark());
    document.documentElement.classList.toggle('ion-palette-dark', isDark);
}

let currentMode: ThemeMode = (localStorage.getItem(THEME_KEY) as ThemeMode) || 'system';
let mediaQuery: MediaQueryList | null = null;
let listeners: ((mode: ThemeMode) => void)[] = [];

function notifyListeners() {
    listeners.forEach((l) => l(currentMode));
}

export const ThemeService = {
    init() {
        applyTheme(currentMode);

        // Listen for system theme changes when in 'system' mode
        mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
            if (currentMode === 'system') {
                applyTheme('system');
            }
        });
    },

    get(): ThemeMode {
        return currentMode;
    },

    set(mode: ThemeMode) {
        currentMode = mode;
        localStorage.setItem(THEME_KEY, mode);
        applyTheme(mode);
        notifyListeners();
    },

    subscribe(listener: (mode: ThemeMode) => void): () => void {
        listeners.push(listener);
        return () => {
            listeners = listeners.filter((l) => l !== listener);
        };
    },
};
