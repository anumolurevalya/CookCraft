import { useEffect, useState } from 'react';
import {
  loadStoredFavorites,
  loadStoredRecipes,
  loadStoredSession,
  saveStoredFavorites,
  saveStoredRecipes,
  saveStoredSession,
  STARTER_RECIPES,
  type Recipe,
  type UserSession,
} from '../../data/recipes';

export function useRecipeStore() {
  const [recipes, setRecipes] = useState<Recipe[]>(() => loadStoredRecipes());
  const [favorites, setFavorites] = useState<number[]>(() => loadStoredFavorites());
  const [user, setUser] = useState<UserSession | null>(() => loadStoredSession());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    saveStoredRecipes(recipes);
  }, [recipes]);

  useEffect(() => {
    saveStoredFavorites(favorites);
  }, [favorites]);

  useEffect(() => {
    saveStoredSession(user);
  }, [user]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((x) => x !== id) : [...prev, id];
      const targetRecipe = recipes.find((r) => r.id === id);
      if (targetRecipe) {
        setToast(
          exists
            ? `Removed "${targetRecipe.name}" from Favorites.`
            : `Saved "${targetRecipe.name}" to Favorites.`,
        );
      }
      return next;
    });
  };

  const signIn = (session: UserSession) => {
    setUser(session);
    setToast(
      session.role === 'admin'
        ? 'Signed in as Administrator.'
        : `Welcome back, ${session.name}.`,
    );
  };

  const signOut = () => {
    setUser(null);
    setToast('Signed out.');
  };

  const addRecipe = (created: Recipe) => {
    setRecipes((prev) => [created, ...prev]);
    setToast(`Published "${created.name}".`);
  };

  const updateRecipe = (updated: Recipe) => {
    setRecipes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setToast(`Updated "${updated.name}".`);
  };

  const deleteRecipe = (id: number) => {
    if (user?.role !== 'admin') return;
    const target = recipes.find((r) => r.id === id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    setFavorites((prev) => prev.filter((x) => x !== id));
    if (target) {
      setToast(`Deleted "${target.name}".`);
    }
  };

  const restoreStarterRecipes = () => {
    setRecipes(STARTER_RECIPES);
    setToast(`Restored all ${STARTER_RECIPES.length} starter recipes.`);
  };

  return {
    recipes,
    favorites,
    user,
    toast,
    toggleFavorite,
    signIn,
    signOut,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    restoreStarterRecipes,
  };
}
