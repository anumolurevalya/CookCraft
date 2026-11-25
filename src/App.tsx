import { ArrowRight, Box, Check, Leaf, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AdminModule from './components/AdminModule';
import DietaryModule from './components/DietaryModule';
import LoginModule from './components/LoginModule';
import RecipeCard from './components/RecipeCard';
import RecipeDetailView from './components/RecipeDetailView';
import Studio3DView from './components/Studio3DView';
import TopBar, { type AppView } from './components/TopBar';
import {
  DIETARY_TAGS,
  FALLBACK_RECIPE_IMAGES,
  HERO_IMAGE,
  loadStoredFavorites,
  loadStoredRecipes,
  loadStoredSession,
  RECIPE_CATEGORIES,
  saveStoredFavorites,
  saveStoredRecipes,
  saveStoredSession,
  STARTER_RECIPES,
  type DietaryTag,
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

  // Filter & Search state
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeDietary, setActiveDietary] = useState<'All' | DietaryTag>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Quick Share form state (for direct Share Recipe view)
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Dinner');
  const [newCuisine, setNewCuisine] = useState('Indian');
  const [newTime, setNewTime] = useState('');
  const [newKcal, setNewKcal] = useState('350');
  const [newDietary, setNewDietary] = useState<DietaryTag[]>(['Vegetarian']);
  const [newImage, setNewImage] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newIngredients, setNewIngredients] = useState('');
  const [newSteps, setNewSteps] = useState('');
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Toast feedback
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

  const filteredRecipes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return recipes.filter((r) => {
      const catMatch =
        activeCategory === 'All' ||
        (activeCategory === 'Indian'
          ? (r.cuisine || '').toLowerCase() === 'indian'
          : r.category === activeCategory);
      const dietaryMatch =
        activeDietary === 'All' || (r.dietary || []).includes(activeDietary);
      const termMatch =
        !term ||
        r.name.toLowerCase().includes(term) ||
        (r.cuisine || '').toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term) ||
        r.ingredients.toLowerCase().includes(term);
      return catMatch && dietaryMatch && termMatch;
    });
  }, [recipes, activeCategory, activeDietary, searchTerm]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: recipes.length,
      Indian: recipes.filter((r) => (r.cuisine || '').toLowerCase() === 'indian').length,
      Breakfast: recipes.filter((r) => r.category === 'Breakfast').length,
      Lunch: recipes.filter((r) => r.category === 'Lunch').length,
      Dinner: recipes.filter((r) => r.category === 'Dinner').length,
      Desserts: recipes.filter((r) => r.category === 'Desserts').length,
      Drinks: recipes.filter((r) => r.category === 'Drinks').length,
      Snacks: recipes.filter((r) => r.category === 'Snacks').length,
    };
    return counts;
  }, [recipes]);

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

  // Admin & Share CRUD handlers
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

  const toggleShareDietary = (tag: DietaryTag) => {
    setNewDietary((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleQuickSharePublish = () => {
    if (user?.role !== 'admin') {
      setShareFeedback('Please sign in as Admin first to publish a recipe.');
      navigate('account');
      return;
    }

    const name = newName.trim();
    const category = newCategory.trim() || 'Dinner';
    const cuisine = newCuisine.trim() || 'Indian';
    const time = newTime.trim() || '30 min';
    const kcal = Math.max(0, Math.round(Number(newKcal) || 350));
    const description = newDescription.trim();
    const ingredients = newIngredients.trim();
    const steps = newSteps.trim();

    if (!name || !description || !ingredients || !steps) {
      setShareFeedback('Please fill in the recipe name, description, ingredients, and steps.');
      return;
    }

    const catLower = category.toLowerCase();
    const fallbackImg =
      catLower === 'breakfast'
        ? FALLBACK_RECIPE_IMAGES.idli_sambar
        : catLower === 'lunch'
          ? FALLBACK_RECIPE_IMAGES.palak_paneer
          : catLower === 'desserts'
            ? FALLBACK_RECIPE_IMAGES.gulab_jamun
            : catLower === 'drinks'
              ? FALLBACK_RECIPE_IMAGES.mango_lassi
              : catLower === 'snacks'
                ? FALLBACK_RECIPE_IMAGES.samosa_chaat
                : FALLBACK_RECIPE_IMAGES.paneer_butter_masala;

    handleAddRecipe({
      id: Date.now(),
      name,
      category,
      cuisine,
      time,
      kcal,
      dietary: newDietary,
      description,
      ingredients,
      steps,
      image: newImage.trim() || fallbackImg,
    });

    setNewName('');
    setNewCategory('Dinner');
    setNewCuisine('Indian');
    setNewTime('');
    setNewKcal('350');
    setNewDietary(['Vegetarian']);
    setNewImage('');
    setNewDescription('');
    setNewIngredients('');
    setNewSteps('');
    setShareFeedback(null);
    navigate('recipes');
  };

  // Fullscreen 3D Kitchen Studio View
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

      {/* Home Editorial Hero */}
      {activeView === 'home' && (
        <section className="max-w-[1280px] w-full mx-auto px-5 md:px-10 pt-7">
          <div
            className="relative rounded-3xl overflow-hidden min-h-[390px] md:min-h-[430px] flex items-center bg-[#18291f] bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(20, 37, 29, 0.93) 0%, rgba(20, 37, 29, 0.72) 50%, rgba(20, 37, 29, 0.14) 100%), url("${HERO_IMAGE}")`,
            }}
          >
            <div className="relative z-10 max-w-[560px] p-8 md:p-14 text-white">
              <p className="text-xs font-bold tracking-[0.14em] text-[#f3b17d] mb-3">
                Good food, good mood
              </p>
              <h1 className="font-display text-4xl sm:text-5xl md:text-[58px] leading-[1.08] font-bold text-balance mb-4">
                Discover recipes. Make something lovely.
              </h1>
              <p className="text-base leading-relaxed text-[#f2f1e9] max-w-[450px] mb-7">
                Explore authentic Indian classics and everyday favourites, inspect plated creations in
                interactive 3D, and manage recipes through the Admin console.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('recipes')}
                  className="px-5 py-3 rounded-lg bg-[#315c43] hover:bg-[#244632] text-white text-sm font-bold whitespace-nowrap cursor-pointer transition-colors"
                >
                  Explore Recipes
                </button>
                <button
                  type="button"
                  onClick={() => open3DStudio(selectedRecipe?.id)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#e88b52] hover:bg-[#d77a41] text-white text-sm font-bold whitespace-nowrap cursor-pointer transition-colors"
                >
                  <Box className="w-4 h-4" />
                  <span>Open 3D Studio</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('share')}
                  className="px-5 py-3 rounded-lg bg-white text-[#315c43] hover:bg-[#fbf8f1] text-sm font-bold whitespace-nowrap cursor-pointer transition-colors"
                >
                  Share Your Recipe
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-5 md:px-10 py-10">
        {/* Explore Recipes Grid (shown on Home and Recipes) */}
        {(activeView === 'home' || activeView === 'recipes') && (
          <section aria-labelledby="explore-heading">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-6">
              <div>
                <p className="text-xs font-bold tracking-[0.14em] text-[#c56b34] mb-1">
                  Made for your kitchen
                </p>
                <h2 id="explore-heading" className="font-display text-3xl font-bold text-[#252b25]">
                  Explore Recipes
                </h2>
                <p className="text-sm text-[#666d63] mt-1">
                  Featuring classic Indian dishes and everyday kitchen inspiration — click any dish to
                  cook or inspect in 3D.
                </p>
              </div>

              <div className="relative w-full md:w-[340px]">
                <Search className="w-4 h-4 text-[#666d63] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search recipes, spices, or cuisine..."
                  aria-label="Search recipes"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e6e2d6] bg-white text-sm text-[#252b25] placeholder:text-[#7a8076] focus:outline-2 focus:outline-[#315c43]"
                />
              </div>
            </div>

            {/* Category & Cuisine Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex flex-wrap items-center gap-2.5" role="group" aria-label="Filter by category or cuisine">
                {RECIPE_CATEGORIES.map((category) => {
                  const isActive = activeCategory === category;
                  const label = category === 'Indian' ? 'Indian Classics' : category;
                  const count = categoryCounts[category] ?? 0;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border whitespace-nowrap cursor-pointer transition-colors tabular-nums ${
                        isActive
                          ? 'bg-[#315c43] text-white border-[#315c43]'
                          : 'bg-white text-[#5d645a] border-[#e6e2d6] hover:border-[#315c43] hover:text-[#315c43]'
                      }`}
                    >
                      {label} ({count})
                    </button>
                  );
                })}
              </div>

              <span className="text-xs font-semibold text-[#666d63] tabular-nums">
                Showing {filteredRecipes.length} of {recipes.length} recipes
              </span>
            </div>

            {/* Inline Dietary Component Strip */}
            <div className="bg-white border border-[#e6e2d6] rounded-2xl px-4 py-3 mb-7 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by dietary preference">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#315c43] mr-1">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>Dietary</span>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveDietary('All')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                    activeDietary === 'All'
                      ? 'bg-[#315c43] text-white border-[#315c43]'
                      : 'bg-[#fbf8f1] text-[#555c52] border-[#e6e2d6] hover:border-[#315c43]'
                  }`}
                >
                  All Preferences
                </button>
                {DIETARY_TAGS.map((tag) => {
                  const active = activeDietary === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setActiveDietary(active ? 'All' : tag)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                        active
                          ? 'bg-[#315c43] text-white border-[#315c43]'
                          : 'bg-[#fbf8f1] text-[#555c52] border-[#e6e2d6] hover:border-[#315c43]'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => navigate('dietary')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#c56b34] hover:text-[#9c4f21] cursor-pointer whitespace-nowrap"
              >
                <span>Open Dietary &amp; Calorie Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {filteredRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    isSaved={favorites.includes(recipe.id)}
                    onViewDetails={openDetail}
                    onOpen3D={open3DStudio}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#e6e2d6] rounded-2xl p-10 text-center">
                <p className="font-display text-xl font-semibold text-[#252b25] mb-2">
                  No recipes matched your search
                </p>
                <p className="text-sm text-[#666d63] mb-4">
                  Try clearing your search term or resetting category and dietary filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('All');
                    setActiveDietary('All');
                  }}
                  className="px-4 py-2 rounded-lg bg-[#315c43] text-white text-sm font-semibold cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </section>
        )}

        {/* Dedicated Dietary & Calorie Guide View */}
        {activeView === 'dietary' && (
          <DietaryModule
            recipes={recipes}
            favorites={favorites}
            onViewDetails={openDetail}
            onOpen3D={open3DStudio}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {/* Favorites View */}
        {activeView === 'favorites' && (
          <section aria-labelledby="favorites-heading">
            <div className="mb-7">
              <p className="text-xs font-bold tracking-[0.14em] text-[#c56b34] mb-1">
                Your collection
              </p>
              <h2 id="favorites-heading" className="font-display text-3xl font-bold text-[#252b25]">
                My Favorites
              </h2>
            </div>

            {savedRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    isSaved={true}
                    onViewDetails={openDetail}
                    onOpen3D={open3DStudio}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#e6e2d6] rounded-2xl p-10 text-center">
                <p className="font-display text-xl font-semibold text-[#252b25] mb-2">
                  You haven&apos;t saved any recipes yet
                </p>
                <p className="text-sm text-[#666d63] mb-5">
                  Tap the heart icon on any dish to collect your favourites here.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('recipes')}
                  className="px-5 py-2.5 rounded-lg bg-[#315c43] hover:bg-[#244632] text-white text-sm font-bold cursor-pointer transition-colors"
                >
                  Explore Recipes
                </button>
              </div>
            )}
          </section>
        )}

        {/* Share Recipe View */}
        {activeView === 'share' && (
          <section className="bg-white border border-[#e6e2d6] rounded-2xl p-6 md:p-8 max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-[#252b25] mb-2">
              Share a Recipe
            </h2>
            <p className="text-sm text-[#666d63] mb-6">
              {user?.role === 'admin' ? (
                'Admin access enabled. Add a new dish to the RecipeHub collection below.'
              ) : (
                <>
                  Sign in as Admin (<span className="font-semibold text-[#252b25]">admin / admin123</span>) to add recipes in this demo.{' '}
                  <button
                    type="button"
                    onClick={() => navigate('account')}
                    className="font-bold text-[#315c43] underline cursor-pointer"
                  >
                    Go to Login Module
                  </button>
                </>
              )}
            </p>

            {shareFeedback && (
              <div className="mb-5 px-4 py-3 rounded-lg bg-[#e88b52]/12 border border-[#e88b52]/30 text-sm text-[#7f3e16]">
                {shareFeedback}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="newName" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                  Recipe name
                </label>
                <input
                  id="newName"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Dal Makhani"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
                />
              </div>

              <div>
                <label htmlFor="newCategory" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                  Category
                </label>
                <select
                  id="newCategory"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="newCuisine" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                  Cuisine
                </label>
                <input
                  id="newCuisine"
                  value={newCuisine}
                  onChange={(e) => setNewCuisine(e.target.value)}
                  placeholder="e.g. Indian"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
                />
              </div>

              <div>
                <label htmlFor="newTime" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                  Preparation time
                </label>
                <input
                  id="newTime"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="e.g. 35 min"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
                />
              </div>

              <div>
                <label htmlFor="newKcal" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                  Calories (kcal / serving)
                </label>
                <input
                  id="newKcal"
                  type="number"
                  min={0}
                  step={5}
                  value={newKcal}
                  onChange={(e) => setNewKcal(e.target.value)}
                  placeholder="e.g. 350"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm tabular-nums focus:outline-2 focus:outline-[#315c43]"
                />
              </div>

              <div>
                <label htmlFor="newImage" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                  Image URL (optional)
                </label>
                <input
                  id="newImage"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="Leave blank for category culinary photo"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
                />
              </div>

              <div className="sm:col-span-2">
                <span className="block text-xs font-semibold text-[#555c52] mb-2">
                  Dietary Tags
                </span>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_TAGS.map((tag) => {
                    const selected = newDietary.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleShareDietary(tag)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                          selected
                            ? 'bg-[#315c43] text-white border-[#315c43]'
                            : 'bg-[#fbf8f1] text-[#555c52] border-[#e6e2d6] hover:border-[#315c43]'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="newDescription" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                  Short description
                </label>
                <textarea
                  id="newDescription"
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe the flavours and texture..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="newIngredients" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                  Ingredients (comma-separated)
                </label>
                <textarea
                  id="newIngredients"
                  rows={3}
                  value={newIngredients}
                  onChange={(e) => setNewIngredients(e.target.value)}
                  placeholder="Black lentils, butter, cream, ginger, tomatoes..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="newSteps" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                  Preparation steps
                </label>
                <textarea
                  id="newSteps"
                  rows={4}
                  value={newSteps}
                  onChange={(e) => setNewSteps(e.target.value)}
                  placeholder="1. Soak and simmer... 2. Temper spices..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuickSharePublish}
              className="px-6 py-3 rounded-lg bg-[#315c43] hover:bg-[#244632] text-white text-sm font-bold cursor-pointer transition-colors"
            >
              Publish Recipe
            </button>
          </section>
        )}

        {/* Dedicated Login Module */}
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

        {/* Recipe Detail View */}
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

        {/* Dedicated Admin Module */}
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

      {/* Footer */}
      <footer className="mt-16 bg-[#244632] text-white py-9 px-6 text-center">
        <div className="font-display text-2xl font-bold tracking-tight mb-1">
          Recipe<span className="text-[#e88b52]">Hub</span>
        </div>
        <p className="text-sm text-[#d7e0d6] mb-1">Discover. Cook. Share.</p>
        <p className="text-xs text-[#b7c6b6]">Made with care for home cooks and culinary makers.</p>
      </footer>

      {/* Non-intrusive Toast Feedback */}
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
