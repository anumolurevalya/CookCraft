import { Box, Heart } from 'lucide-react';
import type { Recipe } from '../data/recipes';
import ResilientImage from './ResilientImage';

interface RecipeCardProps {
  recipe: Recipe;
  isSaved: boolean;
  onViewDetails: (id: number) => void;
  onOpen3D: (id: number) => void;
  onToggleFavorite: (id: number) => void;
}

export default function RecipeCard({
  recipe,
  isSaved,
  onViewDetails,
  onOpen3D,
  onToggleFavorite,
}: RecipeCardProps) {
  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-[0_12px_35px_rgba(36,58,43,0.07)] transition-transform duration-200 hover:-translate-y-1 flex flex-col">
      <button
        type="button"
        onClick={() => onViewDetails(recipe.id)}
        className="block w-full aspect-[4/3] overflow-hidden bg-[#efeae0] cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-[#315c43]"
      >
        <ResilientImage
          src={recipe.image}
          alt={recipe.name}
          title={recipe.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
        />
      </button>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] font-medium text-[#666d63] tabular-nums">
            <span>{recipe.category === 'Other' ? 'Snacks & Sweets' : recipe.category}</span>
            {recipe.cuisine && (
              <>
                <span aria-hidden="true">·</span>
                <span>{recipe.cuisine}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{recipe.time}</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-[#c56b34]">{recipe.kcal} kcal</span>
          </div>

          <h3 className="font-display text-[22px] leading-snug font-semibold text-[#252b25] mt-2.5 mb-2">
            {recipe.name}
          </h3>

          <p className="text-sm text-[#666d63] leading-relaxed line-clamp-2">
            {recipe.description}
          </p>

          {recipe.dietary && recipe.dietary.length > 0 && (
            <p className="mt-2.5 text-xs font-semibold text-[#315c43] truncate">
              {recipe.dietary.slice(0, 3).join(' · ')}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-[#f0ede4]">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onViewDetails(recipe.id)}
              className="text-sm font-bold text-[#315c43] hover:text-[#244632] whitespace-nowrap cursor-pointer transition-colors"
            >
              View Recipe →
            </button>
            <button
              type="button"
              onClick={() => onOpen3D(recipe.id)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#666d63] hover:text-[#e88b52] whitespace-nowrap cursor-pointer transition-colors"
              title="Inspect plated dish in interactive 3D"
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D View</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onToggleFavorite(recipe.id)}
            aria-label={isSaved ? `Remove ${recipe.name} from favorites` : `Save ${recipe.name} to favorites`}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              isSaved
                ? 'border-[#d65b4b]/30 bg-[#d65b4b]/8 text-[#d65b4b]'
                : 'border-[#e6e2d6] bg-white text-[#666d63] hover:text-[#d65b4b]'
            }`}
          >
            <Heart className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </article>
  );
}
