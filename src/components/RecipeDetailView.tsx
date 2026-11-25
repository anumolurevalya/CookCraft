import { Box, Camera, Heart, Maximize2 } from 'lucide-react';
import { useState } from 'react';
import type { Recipe } from '../data/recipes';
import DishViewportCanvas from '../three/DishViewportCanvas';
import ResilientImage from './ResilientImage';

interface RecipeDetailViewProps {
  recipe: Recipe;
  relatedRecipes?: Recipe[];
  isSaved: boolean;
  onBack: () => void;
  onSelectRecipe?: (id: number) => void;
  onToggleFavorite: (id: number) => void;
  onLaunchFullscreen3D: (id: number) => void;
}

export default function RecipeDetailView({
  recipe,
  relatedRecipes = [],
  isSaved,
  onBack,
  onSelectRecipe,
  onToggleFavorite,
  onLaunchFullscreen3D,
}: RecipeDetailViewProps) {
  const [mediaMode, setMediaMode] = useState<'photo' | '3d'>('photo');
  const [explodeFactor, setExplodeFactor] = useState(0);

  const ingredientList = recipe.ingredients
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <section className="bg-white border border-[#e6e2d6] rounded-2xl p-6 md:p-9 my-6">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-bold text-[#315c43] hover:text-[#244632] cursor-pointer transition-colors"
      >
        ← Back to recipes
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6 items-stretch">
        {/* Left Media Column: Photo or Interactive 3D Dish Preview */}
        <div className="flex flex-col gap-3">
          <div className="relative w-full min-h-[340px] lg:h-full rounded-xl overflow-hidden bg-[#efe9dc] border border-[#e6e2d6]">
            {mediaMode === 'photo' ? (
              <ResilientImage
                src={recipe.image}
                alt={recipe.name}
                title={recipe.name}
                className="w-full h-full max-h-[460px] object-cover"
              />
            ) : (
              <div className="w-full h-[380px] lg:h-[440px]">
                <DishViewportCanvas
                  recipe={recipe}
                  explodeFactor={explodeFactor}
                  finishPreset="ceramic"
                  lightingPreset="morning"
                  cameraPreset="hero"
                  cameraPresetSeq={0}
                  autoSpin={false}
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1 p-1 bg-[#f4f1ea] rounded-lg">
              <button
                type="button"
                onClick={() => setMediaMode('photo')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                  mediaMode === 'photo'
                    ? 'bg-white text-[#252b25] shadow-xs'
                    : 'text-[#666d63] hover:text-[#252b25]'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Photo</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaMode('3d')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                  mediaMode === '3d'
                    ? 'bg-white text-[#252b25] shadow-xs'
                    : 'text-[#666d63] hover:text-[#252b25]'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D Preview</span>
              </button>
            </div>

            {mediaMode === '3d' && (
              <label className="flex items-center gap-2 text-xs font-semibold text-[#666d63]">
                <span>Explode</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(explodeFactor * 100)}
                  onChange={(e) => setExplodeFactor(Number(e.target.value) / 100)}
                  className="w-24 accent-[#315c43] cursor-pointer"
                />
              </label>
            )}

            <button
              type="button"
              onClick={() => onLaunchFullscreen3D(recipe.id)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#315c43] hover:text-[#e88b52] cursor-pointer transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Open 3D Studio</span>
            </button>
          </div>
        </div>

        {/* Right Details Column */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider text-[#c56b34] tabular-nums">
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
              <span>{recipe.kcal} kcal / serving</span>
            </div>

            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#252b25] mt-2 mb-3 text-balance">
              {recipe.name}
            </h2>

            <p className="text-[15px] leading-relaxed text-[#555c52] mb-4">
              {recipe.description}
            </p>

            {recipe.dietary && recipe.dietary.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold text-[#315c43] mb-6">
                <span className="text-[#666d63]">Dietary:</span>
                <span>{recipe.dietary.join(' · ')}</span>
              </div>
            )}

            <div className="border-t border-[#ece8dc] pt-5 mb-5">
              <h3 className="font-display text-xl font-semibold text-[#252b25] mb-3">
                Ingredients
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-[#3b4139]">
                {ingredientList.map((ing, idx) => (
                  <li key={idx} className="flex items-baseline gap-2">
                    <span className="text-[#e88b52] font-bold" aria-hidden="true">
                      ·
                    </span>
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-[#ece8dc] pt-5 mb-7">
              <h3 className="font-display text-xl font-semibold text-[#252b25] mb-2.5">
                Preparation
              </h3>
              <p className="text-[15px] leading-relaxed text-[#3b4139] whitespace-pre-line">
                {recipe.steps}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#ece8dc]">
            <button
              type="button"
              onClick={() => onToggleFavorite(recipe.id)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-colors ${
                isSaved
                  ? 'bg-[#d65b4b] text-white hover:bg-[#be4d3e]'
                  : 'bg-[#315c43] text-white hover:bg-[#244632]'
              }`}
            >
              <Heart className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
              <span>{isSaved ? 'Saved in Favorites' : 'Save to Favorites'}</span>
            </button>

            <button
              type="button"
              onClick={() => onLaunchFullscreen3D(recipe.id)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-[#315c43] hover:bg-[#fbf8f1] text-sm font-bold cursor-pointer transition-colors"
            >
              <Box className="w-4 h-4" />
              <span>Inspect in 3D Studio</span>
            </button>
          </div>
        </div>
      </div>

      {relatedRecipes.length > 0 && onSelectRecipe && (
        <div className="mt-10 pt-8 border-t border-[#ece8dc]">
          <div className="flex items-baseline justify-between gap-4 mb-5">
            <div>
              <p className="text-xs font-bold tracking-[0.14em] text-[#c56b34] mb-1">
                Keep cooking
              </p>
              <h3 className="font-display text-2xl font-bold text-[#252b25]">
                More {recipe.category === 'Other' ? 'Snacks & Sweets' : recipe.category} Recipes
              </h3>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-bold text-[#315c43] hover:text-[#244632] cursor-pointer"
            >
              View all →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {relatedRecipes.map((rel) => (
              <button
                key={rel.id}
                type="button"
                onClick={() => {
                  onSelectRecipe(rel.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group text-left bg-[#fbf8f1] rounded-xl overflow-hidden border border-[#e6e2d6] hover:border-[#315c43] transition-colors cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#efe9dc]">
                  <ResilientImage
                    src={rel.image}
                    alt={rel.name}
                    title={rel.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-4">
                  <div className="text-xs font-medium text-[#666d63] tabular-nums">
                    {rel.cuisine ? `${rel.cuisine} · ` : ''}
                    {rel.time} · {rel.kcal} kcal
                  </div>
                  <div className="font-display text-lg font-semibold text-[#252b25] mt-1 group-hover:text-[#315c43]">
                    {rel.name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
