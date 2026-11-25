import { Check } from 'lucide-react';
import { useMemo, useState } from 'react';
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
import { useRecipeStore } from './hooks/useRecipeStore';

export default function RecipeHubApp() {
  const {
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
  } = useRecipeStore();

  const [activeView, setActiveView] = useState<AppView>('home');
  const [previousView, setPreviousView] = useState<AppView>('home');
  const [selectedRecipeId, setSelectedRecipeId] = useState<number>(() => recipes[0]?.id ?? 1);

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
            onAddRecipe={addRecipe}
            onRequireAdmin={() => navigate('account')}
            onPublished={() => navigate('recipes')}
          />
        )}

        {activeView === 'account' && (
          <LoginModule
            user={user}
            favoritesCount={favorites.length}
            recipesCount={recipes.length}
            onLoginSuccess={signIn}
            onLogout={signOut}
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
            onAdminSignIn={signIn}
            onAddRecipe={addRecipe}
            onUpdateRecipe={updateRecipe}
            onDeleteRecipe={deleteRecipe}
            onRestoreStarterRecipes={restoreStarterRecipes}
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
