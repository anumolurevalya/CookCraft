import { ArrowRight, Leaf, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  DIETARY_TAGS,
  RECIPE_CATEGORIES,
  type DietaryTag,
  type Recipe,
} from '../data/recipes';
import RecipeCard from './RecipeCard';

interface ExploreRecipesViewProps {
  recipes: Recipe[];
  favorites: number[];
  onViewDetails: (id: number) => void;
  onOpen3D: (id: number) => void;
  onToggleFavorite: (id: number) => void;
  onOpenDietaryGuide: () => void;
}

export default function ExploreRecipesView({
  recipes,
  favorites,
  onViewDetails,
  onOpen3D,
  onToggleFavorite,
  onOpenDietaryGuide,
}: ExploreRecipesViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeDietary, setActiveDietary] = useState<'All' | DietaryTag>('All');
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
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
            Featuring classic Indian dishes and everyday kitchen inspiration — click any dish to cook
            or inspect in 3D.
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
        <div
          className="flex flex-wrap items-center gap-2.5"
          role="group"
          aria-label="Filter by category or cuisine"
        >
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
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filter by dietary preference"
        >
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
          onClick={onOpenDietaryGuide}
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
              onViewDetails={onViewDetails}
              onOpen3D={onOpen3D}
              onToggleFavorite={onToggleFavorite}
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
  );
}
