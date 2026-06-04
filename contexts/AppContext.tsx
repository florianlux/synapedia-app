import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface AppState {
  favorites: string[]; // substance slugs
  recentlyViewed: string[]; // substance slugs, newest first
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  addRecentlyViewed: (slug: string) => void;
}

const AppContext = createContext<AppState | null>(null);

const MAX_RECENT = 10;

export function AppProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }, []);

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites],
  );

  const addRecentlyViewed = useCallback((slug: string) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((s) => s !== slug);
      return [slug, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);

  return (
    <AppContext.Provider
      value={{ favorites, recentlyViewed, toggleFavorite, isFavorite, addRecentlyViewed }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
