'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Laptop, Moon, Sun } from 'lucide-react';

export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'iswitch-theme';

function resolveMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return mode;
}

function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', resolved);
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [resolved, setResolved] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const initial =
      saved === 'light' || saved === 'dark' || saved === 'system'
        ? saved
        : 'system';
    setModeState(initial);
    const next = resolveMode(initial);
    setResolved(next);
    applyTheme(next);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (mode !== 'system') return;
      const next = resolveMode('system');
      setResolved(next);
      applyTheme(next);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    const resolvedNext = resolveMode(next);
    setResolved(resolvedNext);
    applyTheme(resolvedNext);
  }, []);

  const value = useMemo(
    () => ({ mode, resolved, setMode }),
    [mode, resolved, setMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme requires ThemeProvider');
  return ctx;
}

export function ThemeSwitch() {
  const { mode, setMode } = useTheme();
  const options: ThemeMode[] = ['light', 'dark', 'system'];
  return (
    <div className="theme-switch" role="group" aria-label="Theme">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={mode === opt ? 'active' : ''}
          onClick={() => setMode(opt)}
        >
          {opt === 'light' ? <Sun size={14} /> : opt === 'dark' ? <Moon size={14} /> : <Laptop size={14} />}
          <span>{opt === 'system' ? 'Auto' : opt[0].toUpperCase() + opt.slice(1)}</span>
        </button>
      ))}
    </div>
  );
}
