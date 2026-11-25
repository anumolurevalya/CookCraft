import type { Recipe } from '../../data/recipes';
import RecipeCard from './RecipeCard';

interface FavoritesViewProps {
  savedRecipes: Recipe[];
  onViewDetails: (id: number) => void;
  onOpen3D: (id: number) => void;
  onToggleFavorite: (id: number) => void;
  onExploreRecipes: () => void;
}

export default function FavoritesView({
  savedRecipes,
  onViewDetails,
  onOpen3D,
  onToggleFavorite,
  onExploreRecipes,
}: FavoritesViewProps) {
  return (
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
              onViewDetails={onViewDetails}
              onOpen3D={onOpen3D}
              onToggleFavorite={onToggleFavorite}
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
            onClick={onExploreRecipes}
            className="px-5 py-2.5 rounded-lg bg-[#315c43] hover:bg-[#244632] text-white text-sm font-bold cursor-pointer transition-colors"
          >
            Explore Recipes
          </button>
        </div>
      )}
    </section>
  );
}
