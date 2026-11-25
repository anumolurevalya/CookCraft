import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FileText,
  Heart,
  RotateCw,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Recipe } from '../data/recipes';
import DishViewportCanvas, {
  type CameraPreset,
  type LightingPreset,
} from '../three/DishViewportCanvas';
import type { VesselFinishPreset } from '../three/materials';

interface Studio3DViewProps {
  recipes: Recipe[];
  activeRecipe: Recipe;
  isSaved: boolean;
  onSelectRecipe: (id: number) => void;
  onToggleFavorite: (id: number) => void;
  onOpenRecipeDetail: (id: number) => void;
  onExit: () => void;
}

export default function Studio3DView({
  recipes,
  activeRecipe,
  isSaved,
  onSelectRecipe,
  onToggleFavorite,
  onOpenRecipeDetail,
  onExit,
}: Studio3DViewProps) {
  const [explodeFactor, setExplodeFactor] = useState(0);
  const [finishPreset, setFinishPreset] = useState<VesselFinishPreset>('ceramic');
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('morning');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('hero');
  const [cameraPresetSeq, setCameraPresetSeq] = useState(0);
  const [autoSpin, setAutoSpin] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [inspectedPart, setInspectedPart] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((prev) => !prev);
      } else if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onExit]);

  const activeIdx = recipes.findIndex((r) => r.id === activeRecipe.id);
  const handleStepRecipe = (dir: -1 | 1) => {
    if (recipes.length === 0) return;
    const nextIdx = (activeIdx + dir + recipes.length) % recipes.length;
    onSelectRecipe(recipes[nextIdx].id);
    setInspectedPart(null);
  };

  const triggerCam = (preset: CameraPreset) => {
    setCameraPreset(preset);
    setCameraPresetSeq((s) => s + 1);
  };

  const isDarkBg = lightingPreset === 'bistro';
  const surfaceBg = isDarkBg ? 'rgba(26, 32, 28, 0.94)' : 'rgba(255, 255, 255, 0.94)';
  const surfaceBorder = isDarkBg ? 'rgba(255, 255, 255, 0.14)' : '#e6e2d6';
  const textPrimary = isDarkBg ? '#f4f2ec' : '#252b25';
  const textMuted = isDarkBg ? '#b3b9b0' : '#666d63';
  const subControlBg = isDarkBg ? 'rgba(255, 255, 255, 0.08)' : '#f4f1ea';

  return (
    <div className="fixed inset-0 z-40 w-screen h-screen overflow-hidden">
      {/* Isolated Full-Bleed WebGL Canvas */}
      <div className="absolute inset-0 w-full h-full">
        <DishViewportCanvas
          recipe={activeRecipe}
          explodeFactor={explodeFactor}
          finishPreset={finishPreset}
          lightingPreset={lightingPreset}
          cameraPreset={cameraPreset}
          cameraPresetSeq={cameraPresetSeq}
          autoSpin={autoSpin}
          onInspectPart={setInspectedPart}
        />
      </div>

      {/* Minimal Top-Left Title & Exit Bar (Zero Side Cards, No backdrop-filter) */}
      <div
        className="absolute top-4 left-4 z-10 flex items-center gap-3 px-4 py-2.5 rounded-xl border shadow-sm max-w-[calc(100vw-2rem)]"
        style={{
          backgroundColor: surfaceBg,
          borderColor: surfaceBorder,
          color: textPrimary,
        }}
      >
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          style={{ color: isDarkBg ? '#f3b17d' : '#315c43' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="h-4 w-px shrink-0" style={{ backgroundColor: surfaceBorder }} aria-hidden="true" />

        <div className="min-w-0">
          <div className="font-display text-base sm:text-lg font-semibold leading-tight truncate">
            {activeRecipe.name}
          </div>
          <div className="text-xs flex items-center gap-1.5 tabular-nums truncate" style={{ color: textMuted }}>
            <span>3D Plating Studio</span>
            <span aria-hidden="true">·</span>
            <span>{activeRecipe.category === 'Other' ? 'Snacks & Sweets' : activeRecipe.category}</span>
            <span aria-hidden="true">·</span>
            <span>{activeRecipe.time}</span>
            <span aria-hidden="true">·</span>
            <span>{activeRecipe.kcal} kcal</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenRecipeDetail(activeRecipe.id)}
          className="hidden sm:inline-flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer border transition-colors"
          style={{
            borderColor: surfaceBorder,
            backgroundColor: subControlBg,
            color: textPrimary,
          }}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Recipe</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleFavorite(activeRecipe.id)}
          aria-label={isSaved ? 'Remove from favorites' : 'Save to favorites'}
          className="w-8 h-8 rounded-full border flex items-center justify-center shrink-0 cursor-pointer transition-colors"
          style={{
            borderColor: surfaceBorder,
            color: isSaved ? '#d65b4b' : textMuted,
          }}
        >
          <Heart className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Collapsible Unified Bottom Control Dock */}
      <div
        className="fixed left-1/2 z-20 transition-transform duration-200 ease-out"
        style={{
          bottom: '16px',
          width: 'min(940px, 94vw)',
          transform: dockCollapsed
            ? 'translate(-50%, calc(100% + 24px))'
            : 'translate(-50%, 0)',
        }}
      >
        {/* Collapse / Expand Handle */}
        <div className="flex justify-center mb-1.5">
          <button
            type="button"
            onClick={() => setDockCollapsed((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border text-xs font-semibold shadow-sm cursor-pointer whitespace-nowrap"
            style={{
              backgroundColor: surfaceBg,
              borderColor: surfaceBorder,
              color: textPrimary,
              transform: dockCollapsed ? 'translateY(-48px)' : 'translateY(0)',
              transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show Controls (H)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Hide Controls (H)</span>
              </>
            )}
          </button>
        </div>

        {/* Dock Body */}
        <div
          className="rounded-2xl border shadow-lg px-4 py-3 flex flex-col gap-2.5"
          style={{
            backgroundColor: surfaceBg,
            borderColor: surfaceBorder,
            color: textPrimary,
          }}
        >
          {/* Row 1: Dish Switcher + Exploded Slider + Part Inspection Readout */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Dish Picker */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleStepRecipe(-1)}
                aria-label="Previous recipe"
                className="w-8 h-8 rounded-lg border flex items-center justify-center cursor-pointer"
                style={{ borderColor: surfaceBorder, backgroundColor: subControlBg }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <select
                aria-label="Select dish model"
                value={activeRecipe.id}
                onChange={(e) => {
                  onSelectRecipe(Number(e.target.value));
                  setInspectedPart(null);
                }}
                className="h-8 px-2.5 rounded-lg border text-xs font-semibold cursor-pointer max-w-[210px]"
                style={{
                  borderColor: surfaceBorder,
                  backgroundColor: subControlBg,
                  color: textPrimary,
                }}
              >
                {(['Breakfast', 'Lunch', 'Dinner', 'Desserts', 'Drinks', 'Snacks', 'Other'] as const).map((cat) => {
                  const group = recipes.filter((r) =>
                    cat === 'Other'
                      ? !['Breakfast', 'Lunch', 'Dinner', 'Desserts', 'Drinks', 'Snacks'].includes(r.category)
                      : r.category === cat,
                  );
                  if (group.length === 0) return null;
                  return (
                    <optgroup
                      key={cat}
                      label={cat === 'Other' ? 'More Dishes' : cat}
                      style={{ color: '#252b25', background: '#fff' }}
                    >
                      {group.map((r) => (
                        <option key={r.id} value={r.id} style={{ color: '#252b25', background: '#fff' }}>
                          {r.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
              <button
                type="button"
                onClick={() => handleStepRecipe(1)}
                aria-label="Next recipe"
                className="w-8 h-8 rounded-lg border flex items-center justify-center cursor-pointer"
                style={{ borderColor: surfaceBorder, backgroundColor: subControlBg }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-semibold tabular-nums ml-1 hidden sm:inline" style={{ color: textMuted }}>
                {activeIdx + 1}/{recipes.length}
              </span>
            </div>

            {/* Exploded Plating Slider */}
            <label className="flex items-center gap-2.5 text-xs font-semibold flex-1 min-w-[200px] max-w-[290px]">
              <span className="whitespace-nowrap" style={{ color: textMuted }}>
                Explode Layers
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(explodeFactor * 100)}
                onChange={(e) => setExplodeFactor(Number(e.target.value) / 100)}
                className="w-full accent-[#315c43] cursor-pointer"
              />
              <span className="tabular-nums w-9 text-right">
                {Math.round(explodeFactor * 100)}%
              </span>
            </label>

            {/* Static Inspection Readout */}
            <div
              className="text-xs font-medium truncate max-w-[250px]"
              style={{ color: inspectedPart ? (isDarkBg ? '#f3b17d' : '#315c43') : textMuted }}
            >
              {inspectedPart ? `Layer: ${inspectedPart}` : 'Drag to orbit · Hover dish layers'}
            </div>
          </div>

          {/* Row 2: Vessel Finish, Lighting, Camera Presets, Auto-Spin */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t" style={{ borderColor: surfaceBorder }}>
            {/* Finish Swatches */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ backgroundColor: subControlBg }}>
              {(['ceramic', 'slate', 'copper'] as const).map((finish) => {
                const active = finishPreset === finish;
                return (
                  <button
                    key={finish}
                    type="button"
                    onClick={() => setFinishPreset(finish)}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold capitalize whitespace-nowrap cursor-pointer transition-colors"
                    style={{
                      backgroundColor: active ? '#315c43' : 'transparent',
                      color: active ? '#ffffff' : textMuted,
                    }}
                  >
                    {finish}
                  </button>
                );
              })}
            </div>

            {/* Lighting Presets */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ backgroundColor: subControlBg }}>
              {(['morning', 'bistro', 'studio'] as const).map((light) => {
                const active = lightingPreset === light;
                return (
                  <button
                    key={light}
                    type="button"
                    onClick={() => setLightingPreset(light)}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold capitalize whitespace-nowrap cursor-pointer transition-colors"
                    style={{
                      backgroundColor: active ? '#e88b52' : 'transparent',
                      color: active ? '#ffffff' : textMuted,
                    }}
                  >
                    {light}
                  </button>
                );
              })}
            </div>

            {/* Camera Views & Spin */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ backgroundColor: subControlBg }}>
                {(
                  [
                    { id: 'hero', label: 'Hero' },
                    { id: 'overhead', label: 'Top' },
                    { id: 'closeup', label: 'Close' },
                    { id: 'side', label: 'Side' },
                  ] as const
                ).map((cam) => {
                  const active = cameraPreset === cam.id;
                  return (
                    <button
                      key={cam.id}
                      type="button"
                      onClick={() => triggerCam(cam.id)}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors"
                      style={{
                        backgroundColor: active ? (isDarkBg ? '#ffffff' : '#252b25') : 'transparent',
                        color: active ? (isDarkBg ? '#252b25' : '#ffffff') : textMuted,
                      }}
                    >
                      {cam.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setAutoSpin((s) => !s)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors"
                style={{
                  borderColor: autoSpin ? '#315c43' : surfaceBorder,
                  backgroundColor: autoSpin ? '#315c43' : subControlBg,
                  color: autoSpin ? '#ffffff' : textPrimary,
                }}
                aria-pressed={autoSpin}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Spin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
