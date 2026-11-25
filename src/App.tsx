import { Check } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AdminModule from './components/AdminModule';
import DietaryModule from './components/DietaryModule';
import ExploreRecipesView from './components/ExploreRecipesView';
import FavoritesView from './components/FavoritesView';
import HomeHero from './components/HomeHero';
import LoginModule from './components/LoginModule';
import RecipeDetailView from './components/RecipeDetailView';
import ShareRecipeView from './components/ShareRecipeView';
import Studio3DView from './components/Studio3DView';
import TopBar, { type AppView } from './components/TopBar';
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
} from './data/recipes';

export default function App() {
  const [recipes, setRecipes] = useState<Recipe[]>(() => loadStoredRecipes());
  const [favorites, setFavorites] = useState<number[]>(() => loadStoredFavorites());
  const [user, setUser] = useState<UserSession | null>(() => loadStoredSession());

  const [activeView, setActiveView] = useState<AppView>('home');
  const [previousView, setPreviousView] = useState<AppView>('home');
  const [selectedRecipeId, setSelectedRecipeId] = useState<number>(() => recipes[0]?.id ?? 1);
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

  const navigate = (view: AppView) => {
    if (view !== 'studio' && view !== 'detail') {
      setPreviousView(view);
    } else if (activeView !== 'studio' && activeView !== 'detail') {
      setPreviousView(activeView);
    }
    setActiveView(view);
    if (view !== 'studio') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openDetail = (id: number) => {
    setSelectedRecipeId(id);
    navigate('detail');
  };

  const open3DStudio = (id?: number) => {
    if (typeof id === 'number') {
      setSelectedRecipeId(id);
    }
    navigate('studio');
  };

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

  const savedRecipes = useMemo(
    () => recipes.filter((r) => favorites.includes(r.id)),
    [recipes, favorites],
  );

  const selectedRecipe = useMemo(
    () => recipes.find((r) => r.id === selectedRecipeId) ?? recipes[0],
    [recipes, selectedRecipeId],
  );

  const relatedRecipes = useMemo(() => {
    if (!selectedRecipe) return [];
    const sameCat = recipes.filter(
      (r) => r.id !== selectedRecipe.id && r.category === selectedRecipe.category,
    );
    if (sameCat.length >= 3) return sameCat.slice(0, 3);
    const sameCuisine = recipes.filter(
      (r) =>
        r.id !== selectedRecipe.id &&
        r.category !== selectedRecipe.category &&
        r.cuisine === selectedRecipe.cuisine,
    );
    return [...sameCat, ...sameCuisine].slice(0, 3);
  }, [recipes, selectedRecipe]);

  const handleLoginSuccess = (session: UserSession) => {
    setUser(session);
    setToast(
      session.role === 'admin'
        ? 'Signed in as Administrator.'
        : `Welcome back, ${session.name}.`,
    );
  };

  const handleLogout = () => {
    setUser(null);
    setToast('Signed out.');
  };

  const handleAddRecipe = (created: Recipe) => {
    setRecipes((prev) => [created, ...prev]);
    setToast(`Published "${created.name}".`);
  };

  const handleUpdateRecipe = (updated: Recipe) => {
    setRecipes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setToast(`Updated "${updated.name}".`);
  };

  const handleDeleteRecipe = (id: number) => {
    if (user?.role !== 'admin') return;
    const target = recipes.find((r) => r.id === id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    setFavorites((prev) => prev.filter((x) => x !== id));
    if (target) {
      setToast(`Deleted "${target.name}".`);
    }
  };

  const handleRestoreStarterRecipes = () => {
    setRecipes(STARTER_RECIPES);
    setToast(`Restored all ${STARTER_RECIPES.length} starter recipes.`);
  };

  if (activeView === 'studio' && selectedRecipe) {
    return (
      <Studio3DView
        recipes={recipes}
        activeRecipe={selectedRecipe}
        isSaved={favorites.includes(selectedRecipe.id)}
        onSelectRecipe={(id) => setSelectedRecipeId(id)}
        onToggleFavorite={toggleFavorite}
        onOpenRecipeDetail={(id) => openDetail(id)}
        onExit={() => navigate(previousView)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf8f1] text-[#252b25]">
      <TopBar
        activeView={activeView}
        user={user}
        favoritesCount={favorites.length}
        onNavigate={navigate}
      />

      {activeView === 'home' && (
        <HomeHero
          featuredRecipeId={selectedRecipe?.id}
          onNavigate={navigate}
          onOpen3D={open3DStudio}
        />
      )}

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-5 md:px-10 py-10">
        {(activeView === 'home' || activeView === 'recipes') && (
          <ExploreRecipesView
            recipes={recipes}
            favorites={favorites}
            onViewDetails={openDetail}
            onOpen3D={open3DStudio}
            onToggleFavorite={toggleFavorite}
            onOpenDietaryGuide={() => navigate('dietary')}
          />
        )}

        {activeView === 'dietary' && (
          <DietaryModule
            recipes={recipes}
            favorites={favorites}
            onViewDetails={openDetail}
            onOpen3D={open3DStudio}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {activeView === 'favorites' && (
          <FavoritesView
            savedRecipes={savedRecipes}
            onViewDetails={openDetail}
            onOpen3D={open3DStudio}
            onToggleFavorite={toggleFavorite}
            onExploreRecipes={() => navigate('recipes')}
          />
        )}

        {activeView === 'share' && (
          <ShareRecipeView
            user={user}
            onAddRecipe={handleAddRecipe}
            onRequireAdmin={() => navigate('account')}
            onPublished={() => navigate('recipes')}
          />
        )}

        {activeView === 'account' && (
          <LoginModule
            user={user}
            favoritesCount={favorites.length}
            recipesCount={recipes.length}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
            onNavigate={navigate}
          />
        )}

        {activeView === 'detail' && selectedRecipe && (
          <RecipeDetailView
            recipe={selectedRecipe}
            relatedRecipes={relatedRecipes}
            isSaved={favorites.includes(selectedRecipe.id)}
            onBack={() => navigate('recipes')}
            onSelectRecipe={openDetail}
            onToggleFavorite={toggleFavorite}
            onLaunchFullscreen3D={open3DStudio}
          />
        )}

        {activeView === 'admin' && (
          <AdminModule
            user={user}
            recipes={recipes}
            favorites={favorites}
            onAdminSignIn={handleLoginSuccess}
            onAddRecipe={handleAddRecipe}
            onUpdateRecipe={handleUpdateRecipe}
            onDeleteRecipe={handleDeleteRecipe}
            onRestoreStarterRecipes={handleRestoreStarterRecipes}
            onViewRecipe={openDetail}
            onOpen3D={open3DStudio}
          />
        )}
      </main>

      <footer className="mt-16 bg-[#244632] text-white py-9 px-6 text-center">
        <div className="font-display text-2xl font-bold tracking-tight mb-1">
          Recipe<span className="text-[#e88b52]">Hub</span>
        </div>
        <p className="text-sm text-[#d7e0d6] mb-1">Discover. Cook. Share.</p>
        <p className="text-xs text-[#b7c6b6]">Made with care for home cooks and culinary makers.</p>
      </footer>

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#244632] text-white text-sm font-medium shadow-lg border border-white/15"
        >
          <Check className="w-4 h-4 text-[#f3b17d] shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
