import { Box } from 'lucide-react';
import { HERO_IMAGE } from '../../data/recipes';
import type { AppView } from './TopBar';

interface HomeHeroProps {
  featuredRecipeId?: number;
  onNavigate: (view: AppView) => void;
  onOpen3D: (id?: number) => void;
}

export default function HomeHero({
  featuredRecipeId,
  onNavigate,
  onOpen3D,
}: HomeHeroProps) {
  return (
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
              onClick={() => onNavigate('recipes')}
              className="px-5 py-3 rounded-lg bg-[#315c43] hover:bg-[#244632] text-white text-sm font-bold whitespace-nowrap cursor-pointer transition-colors"
            >
              Explore Recipes
            </button>
            <button
              type="button"
              onClick={() => onOpen3D(featuredRecipeId)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#e88b52] hover:bg-[#d77a41] text-white text-sm font-bold whitespace-nowrap cursor-pointer transition-colors"
            >
              <Box className="w-4 h-4" />
              <span>Open 3D Studio</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('share')}
              className="px-5 py-3 rounded-lg bg-white text-[#315c43] hover:bg-[#fbf8f1] text-sm font-bold whitespace-nowrap cursor-pointer transition-colors"
            >
              Share Your Recipe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
