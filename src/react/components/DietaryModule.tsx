import { Flame, Leaf, Search, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DIETARY_TAGS, type DietaryTag, type Recipe } from '../../data/recipes';
import RecipeCard from './RecipeCard';

interface DietaryModuleProps {
  recipes: Recipe[];
  favorites: number[];
  onViewDetails: (id: number) => void;
  onOpen3D: (id: number) => void;
  onToggleFavorite: (id: number) => void;
}

type CalorieFilter = 'all' | 'under200' | 'under350' | 'under500' | '500plus';
type CalorieSort = 'default' | 'kcal-asc' | 'kcal-desc';

const CATEGORY_OPTIONS = [
  'All',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Desserts',
  'Drinks',
  'Snacks',
] as const;

export default function DietaryModule({
  recipes,
  favorites,
  onViewDetails,
  onOpen3D,
  onToggleFavorite,
}: DietaryModuleProps) {
  const [selectedTag, setSelectedTag] = useState<'All' | DietaryTag>('All');
  const [calorieFilter, setCalorieFilter] = useState<CalorieFilter>('all');
  const [mealCategory, setMealCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<CalorieSort>('default');
  const [searchTerm, setSearchTerm] = useState('');

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = { All: recipes.length };
    for (const tag of DIETARY_TAGS) {
      counts[tag] = recipes.filter((r) => r.dietary.includes(tag)).length;
    }
    return counts;
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const list = recipes.filter((r) => {
      const matchTag = selectedTag === 'All' || r.dietary.includes(selectedTag);
      const matchCat = mealCategory === 'All' || r.category === mealCategory;
      const matchKcal =
        calorieFilter === 'all'
          ? true
          : calorieFilter === 'under200'
            ? r.kcal < 200
            : calorieFilter === 'under350'
              ? r.kcal <= 350
              : calorieFilter === 'under500'
                ? r.kcal <= 500
                : r.kcal > 500;
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.ingredients.toLowerCase().includes(q) ||
        (r.cuisine || '').toLowerCase().includes(q);
      return matchTag && matchCat && matchKcal && matchSearch;
    });

    if (sortBy === 'kcal-asc') {
      return [...list].sort((a, b) => a.kcal - b.kcal);
    }
    if (sortBy === 'kcal-desc') {
      return [...list].sort((a, b) => b.kcal - a.kcal);
    }
    return list;
  }, [recipes, selectedTag, mealCategory, calorieFilter, searchTerm, sortBy]);

  const avgKcal = useMemo(() => {
    if (filteredRecipes.length === 0) return 0;
    const sum = filteredRecipes.reduce((acc, r) => acc + r.kcal, 0);
    return Math.round(sum / filteredRecipes.length);
  }, [filteredRecipes]);

  const resetAll = () => {
    setSelectedTag('All');
    setCalorieFilter('all');
    setMealCategory('All');
    setSortBy('default');
    setSearchTerm('');
  };

  return (
    <section className="space-y-7" aria-labelledby="dietary-heading">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-[#c56b34] mb-1">
            Nutrition &amp; Preferences
          </p>
          <h2 id="dietary-heading" className="font-display text-3xl md:text-4xl font-bold text-[#252b25]">
            Dietary &amp; Calorie Guide
          </h2>
          <p className="text-sm text-[#666d63] mt-1 max-w-2xl">
            Filter every meal, dessert, and drink by dietary preference and calorie count per serving.
          </p>
        </div>

        <div className="relative w-full md:w-[320px]">
          <Search className="w-4 h-4 text-[#666d63] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search dishes or ingredients..."
            aria-label="Search dietary recipes"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e6e2d6] bg-white text-sm text-[#252b25] placeholder:text-[#7a8076] focus:outline-2 focus:outline-[#315c43]"
          />
        </div>
      </div>

      {/* 4-Column Nutrition Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e6e2d6] rounded-xl px-5 py-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#666d63]">
            <Leaf className="w-3.5 h-3.5 text-[#315c43]" />
            <span>Vegan Dishes</span>
          </div>
          <div className="font-display text-2xl font-bold text-[#315c43] mt-1 tabular-nums">
            {tagCounts['Vegan'] ?? 0}
          </div>
        </div>
        <div className="bg-white border border-[#e6e2d6] rounded-xl px-5 py-4">
          <div className="text-xs font-medium text-[#666d63]">Gluten-Free Options</div>
          <div className="font-display text-2xl font-bold text-[#252b25] mt-1 tabular-nums">
            {tagCounts['Gluten-Free'] ?? 0}
          </div>
        </div>
        <div className="bg-white border border-[#e6e2d6] rounded-xl px-5 py-4">
          <div className="text-xs font-medium text-[#666d63]">High-Protein Picks</div>
          <div className="font-display text-2xl font-bold text-[#c56b34] mt-1 tabular-nums">
            {tagCounts['High-Protein'] ?? 0}
          </div>
        </div>
        <div className="bg-white border border-[#e6e2d6] rounded-xl px-5 py-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#666d63]">
            <Flame className="w-3.5 h-3.5 text-[#e88b52]" />
            <span>Average Energy</span>
          </div>
          <div className="font-display text-2xl font-bold text-[#252b25] mt-1 tabular-nums">
            {avgKcal} <span className="text-sm font-sans font-semibold text-[#666d63]">kcal</span>
          </div>
        </div>
      </div>

      {/* Dietary Tag Selector + Calorie & Course Controls */}
      <div className="bg-white border border-[#e6e2d6] rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Dietary preference filter">
          {(['All', ...DIETARY_TAGS] as const).map((tag) => {
            const active = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border whitespace-nowrap cursor-pointer transition-colors tabular-nums ${
                  active
                    ? 'bg-[#315c43] text-white border-[#315c43]'
                    : 'bg-[#fbf8f1] text-[#555c52] border-[#e6e2d6] hover:border-[#315c43] hover:text-[#315c43]'
                }`}
              >
                {tag} ({tagCounts[tag] ?? 0})
              </button>
            );
          })}
        </div>

        <div className="pt-3 border-t border-[#ece8dc] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#666d63]">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Course:</span>
            </div>
            <select
              aria-label="Filter dietary view by course"
              value={mealCategory}
              onChange={(e) => setMealCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#e6e2d6] bg-[#fbf8f1] text-xs font-semibold text-[#252b25] focus:outline-2 focus:outline-[#315c43] cursor-pointer"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Courses' : cat}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by calorie range"
              value={calorieFilter}
              onChange={(e) => setCalorieFilter(e.target.value as CalorieFilter)}
              className="px-3 py-1.5 rounded-lg border border-[#e6e2d6] bg-[#fbf8f1] text-xs font-semibold text-[#252b25] focus:outline-2 focus:outline-[#315c43] cursor-pointer"
            >
              <option value="all">Any Calories (kcal)</option>
              <option value="under200">Light (&lt; 200 kcal)</option>
              <option value="under350">Balanced (&le; 350 kcal)</option>
              <option value="under500">Moderate (&le; 500 kcal)</option>
              <option value="500plus">Hearty (&gt; 500 kcal)</option>
            </select>

            <select
              aria-label="Sort by calories"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as CalorieSort)}
              className="px-3 py-1.5 rounded-lg border border-[#e6e2d6] bg-[#fbf8f1] text-xs font-semibold text-[#252b25] focus:outline-2 focus:outline-[#315c43] cursor-pointer"
            >
              <option value="default">Sort: Featured</option>
              <option value="kcal-asc">Calories: Low to High</option>
              <option value="kcal-desc">Calories: High to Low</option>
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-[#666d63] tabular-nums">
            <span>
              Showing {filteredRecipes.length} of {recipes.length} recipes
            </span>
            {(selectedTag !== 'All' ||
              calorieFilter !== 'all' ||
              mealCategory !== 'All' ||
              sortBy !== 'default' ||
              searchTerm.trim() !== '') && (
              <button
                type="button"
                onClick={resetAll}
                className="text-[#315c43] underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Grid */}
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
            No recipes matched these dietary filters
          </p>
          <p className="text-sm text-[#666d63] mb-4">
            Try widening your calorie limit or clearing the selected dietary tag.
          </p>
          <button
            type="button"
            onClick={resetAll}
            className="px-4 py-2 rounded-lg bg-[#315c43] text-white text-sm font-semibold cursor-pointer"
          >
            Reset Dietary Filters
          </button>
        </div>
      )}
    </section>
  );
}
