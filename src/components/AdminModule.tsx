import {
  Box,
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  DIETARY_TAGS,
  FALLBACK_RECIPE_IMAGES,
  STARTER_RECIPES,
  type DietaryTag,
  type DishModelKey,
  type Recipe,
  type UserSession,
} from '../data/recipes';
import ResilientImage from './ResilientImage';

interface AdminModuleProps {
  user: UserSession | null;
  recipes: Recipe[];
  favorites: number[];
  onAdminSignIn: (session: UserSession) => void;
  onAddRecipe: (recipe: Recipe) => void;
  onUpdateRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (id: number) => void;
  onRestoreStarterRecipes: () => void;
  onViewRecipe: (id: number) => void;
  onOpen3D: (id: number) => void;
}

interface RecipeFormState {
  id: number | null;
  name: string;
  category: string;
  cuisine: string;
  time: string;
  kcal: string;
  dietary: DietaryTag[];
  image: string;
  description: string;
  ingredients: string;
  steps: string;
  dishModelKey?: DishModelKey;
}

const EMPTY_FORM: RecipeFormState = {
  id: null,
  name: '',
  category: 'Dinner',
  cuisine: 'Indian',
  time: '30 min',
  kcal: '350',
  dietary: ['Vegetarian'],
  image: '',
  description: '',
  ingredients: '',
  steps: '',
};

const PHOTO_PRESETS: Array<{ label: string; url: string; key: DishModelKey }> = [
  { label: 'Paneer Butter Masala', url: FALLBACK_RECIPE_IMAGES.paneer_butter_masala, key: 'paneer_butter_masala' },
  { label: 'Chicken Biryani', url: FALLBACK_RECIPE_IMAGES.biryani, key: 'biryani' },
  { label: 'Dal Makhani', url: FALLBACK_RECIPE_IMAGES.dal_makhani, key: 'dal_makhani' },
  { label: 'Rajma Chawal', url: FALLBACK_RECIPE_IMAGES.rajma_chawal, key: 'rajma_chawal' },
  { label: 'Idli Sambar', url: FALLBACK_RECIPE_IMAGES.idli_sambar, key: 'idli_sambar' },
  { label: 'Chole Bhature', url: FALLBACK_RECIPE_IMAGES.chole_bhature, key: 'chole_bhature' },
  { label: 'Palak Paneer', url: FALLBACK_RECIPE_IMAGES.palak_paneer, key: 'palak_paneer' },
  { label: 'Aloo Paratha', url: FALLBACK_RECIPE_IMAGES.aloo_paratha, key: 'aloo_paratha' },
  { label: 'Masala Dosa', url: FALLBACK_RECIPE_IMAGES.dosa, key: 'dosa' },
  { label: 'Kanda Poha', url: FALLBACK_RECIPE_IMAGES.poha, key: 'poha' },
  { label: 'Samosa Chaat', url: FALLBACK_RECIPE_IMAGES.samosa_chaat, key: 'samosa_chaat' },
  { label: 'Mumbai Pav Bhaji', url: FALLBACK_RECIPE_IMAGES.pav_bhaji, key: 'pav_bhaji' },
  { label: 'Tandoori Paneer Tikka', url: FALLBACK_RECIPE_IMAGES.paneer_tikka, key: 'paneer_tikka' },
  { label: 'Warm Gulab Jamun', url: FALLBACK_RECIPE_IMAGES.gulab_jamun, key: 'gulab_jamun' },
  { label: 'Saffron Rasmalai', url: FALLBACK_RECIPE_IMAGES.rasmalai, key: 'rasmalai' },
  { label: 'Gajar Ka Halwa', url: FALLBACK_RECIPE_IMAGES.gajar_halwa, key: 'gajar_halwa' },
  { label: 'Molten Lava Cake', url: FALLBACK_RECIPE_IMAGES.lava_cake, key: 'lava_cake' },
  { label: 'Espresso Tiramisu', url: FALLBACK_RECIPE_IMAGES.tiramisu, key: 'tiramisu' },
  { label: 'Alphonso Mango Lassi', url: FALLBACK_RECIPE_IMAGES.mango_lassi, key: 'mango_lassi' },
  { label: 'Masala Chai', url: FALLBACK_RECIPE_IMAGES.masala_chai, key: 'masala_chai' },
  { label: 'Nimbu Pani', url: FALLBACK_RECIPE_IMAGES.nimbu_pani, key: 'nimbu_pani' },
  { label: 'Iced Matcha Oat Latte', url: FALLBACK_RECIPE_IMAGES.matcha_latte, key: 'matcha_latte' },
  { label: 'Chickpea Curry', url: FALLBACK_RECIPE_IMAGES.curry, key: 'curry' },
  { label: 'Garlic Pasta', url: FALLBACK_RECIPE_IMAGES.pasta, key: 'pasta' },
  { label: 'Mushroom Risotto', url: FALLBACK_RECIPE_IMAGES.risotto, key: 'risotto' },
  { label: 'Garden Salad', url: FALLBACK_RECIPE_IMAGES.salad, key: 'salad' },
  { label: 'Falafel Mezze Bowl', url: FALLBACK_RECIPE_IMAGES.falafel_bowl, key: 'falafel_bowl' },
  { label: 'Fluffy Pancakes', url: FALLBACK_RECIPE_IMAGES.pancakes, key: 'pancakes' },
  { label: 'Avocado Egg Toast', url: FALLBACK_RECIPE_IMAGES.avocado_toast, key: 'avocado_toast' },
  { label: 'Homemade Pizza', url: FALLBACK_RECIPE_IMAGES.pizza, key: 'pizza' },
];

export default function AdminModule({
  user,
  recipes,
  favorites,
  onAdminSignIn,
  onAddRecipe,
  onUpdateRecipe,
  onDeleteRecipe,
  onRestoreStarterRecipes,
  onViewRecipe,
  onOpen3D,
}: AdminModuleProps) {
  // Admin Gate state
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [gateError, setGateError] = useState<string | null>(null);

  // Catalog management state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState<RecipeFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);

  const indianCount = useMemo(
    () => recipes.filter((r) => (r.cuisine || '').toLowerCase() === 'indian').length,
    [recipes],
  );

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return recipes.filter((r) => {
      const matchCat =
        categoryFilter === 'All' ||
        (categoryFilter === 'Indian'
          ? (r.cuisine || '').toLowerCase() === 'indian'
          : r.category === categoryFilter);
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        (r.cuisine || '').toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [recipes, searchTerm, categoryFilter]);

  const handleGateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUser.trim() === 'admin' && adminPass === 'admin123') {
      setGateError(null);
      onAdminSignIn({ name: 'admin', role: 'admin' });
    } else {
      setGateError('Invalid Admin credentials. Expected admin / admin123.');
    }
  };

  const openCreateForm = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setEditorOpen(true);
  };

  const openEditForm = (recipe: Recipe) => {
    setForm({
      id: recipe.id,
      name: recipe.name,
      category: recipe.category,
      cuisine: recipe.cuisine || 'Indian',
      time: recipe.time,
      kcal: String(recipe.kcal ?? 350),
      dietary: recipe.dietary && recipe.dietary.length > 0 ? recipe.dietary : ['Vegetarian'],
      image: recipe.image,
      description: recipe.description,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      dishModelKey: recipe.dishModelKey,
    });
    setFormError(null);
    setEditorOpen(true);
  };

  const toggleFormDietary = (tag: DietaryTag) => {
    setForm((f) => {
      const exists = f.dietary.includes(tag);
      return {
        ...f,
        dietary: exists ? f.dietary.filter((t) => t !== tag) : [...f.dietary, tag],
      };
    });
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim() || !form.ingredients.trim() || !form.steps.trim()) {
      setFormError('Recipe name, description, ingredients, and preparation steps are required.');
      return;
    }

    const catLower = form.category.toLowerCase();
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

    const parsedKcal = Math.max(0, Math.round(Number(form.kcal) || 350));

    const payload: Recipe = {
      id: form.id ?? Date.now(),
      name: form.name.trim(),
      category: form.category.trim() || 'Dinner',
      cuisine: form.cuisine.trim() || 'Indian',
      time: form.time.trim() || '30 min',
      kcal: parsedKcal,
      dietary: form.dietary,
      image: form.image.trim() || fallbackImg,
      description: form.description.trim(),
      ingredients: form.ingredients.trim(),
      steps: form.steps.trim(),
      dishModelKey: form.dishModelKey,
    };

    if (form.id !== null) {
      onUpdateRecipe(payload);
    } else {
      onAddRecipe(payload);
    }
    setEditorOpen(false);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  // Admin Gate if not signed in as Admin
  if (user?.role !== 'admin') {
    return (
      <section className="max-w-xl mx-auto bg-white border border-[#e6e2d6] rounded-2xl p-6 md:p-9">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#e88b52]/12 text-[#c56b34] flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-[#c56b34] mb-1">
              Admin Module
            </p>
            <h2 className="font-display text-3xl font-bold text-[#252b25]">
              Administrator Sign In
            </h2>
            <p className="text-sm text-[#666d63] mt-1">
              Sign in as Admin to create, edit, or delete recipes in the RecipeHub catalog.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 rounded-xl bg-[#fbf8f1] border border-[#ece8dc] mb-5 text-xs text-[#555c52]">
          <span>
            Demo credentials: <strong className="text-[#252b25]">admin / admin123</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              setAdminUser('admin');
              setAdminPass('admin123');
              setGateError(null);
            }}
            className="px-2.5 py-1 rounded-md border border-[#e6e2d6] bg-white font-semibold text-[#315c43] hover:bg-[#f4f1ea] cursor-pointer"
          >
            Fill Admin Credentials
          </button>
        </div>

        <form onSubmit={handleGateLogin} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="admin-gate-user" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                Admin Username
              </label>
              <input
                id="admin-gate-user"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                placeholder="admin"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
              />
            </div>

            <div>
              <label htmlFor="admin-gate-pass" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                Password
              </label>
              <input
                id="admin-gate-pass"
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="admin123"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-[#315c43] hover:bg-[#244632] text-white text-sm font-bold cursor-pointer transition-colors"
          >
            Unlock Admin Dashboard
          </button>

          {gateError && (
            <p role="alert" className="text-sm font-medium text-[#b93829]">
              {gateError}
            </p>
          )}
        </form>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-[#c56b34] mb-1">
            Admin Console
          </p>
          <h2 className="font-display text-3xl font-bold text-[#252b25]">
            Recipe Catalog Management
          </h2>
          <p className="text-sm text-[#666d63] mt-1">
            Add new dishes, edit existing recipes, inspect 3D models, or manage catalog entries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {confirmRestore ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#e6e2d6] bg-white text-xs">
              <span className="font-medium text-[#252b25]">
                Restore all {STARTER_RECIPES.length} starter recipes?
              </span>
              <button
                type="button"
                onClick={() => {
                  onRestoreStarterRecipes();
                  setConfirmRestore(false);
                }}
                className="px-2.5 py-1 rounded bg-[#315c43] text-white font-semibold cursor-pointer"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmRestore(false)}
                className="px-2 py-1 rounded text-[#666d63] hover:text-[#252b25] font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmRestore(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#e6e2d6] bg-white hover:bg-[#fbf8f1] text-[#555c52] text-sm font-semibold cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Starter Catalog</span>
            </button>
          )}

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#315c43] hover:bg-[#244632] text-white text-sm font-bold cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Recipe</span>
          </button>
        </div>
      </div>

      {/* 4-Column Metric Strip (Tabular Figures, Flat Hairline Borders) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e6e2d6] rounded-xl px-5 py-4">
          <div className="text-xs font-medium text-[#666d63]">Total Recipes</div>
          <div className="font-display text-2xl font-bold text-[#252b25] mt-1 tabular-nums">
            {recipes.length}
          </div>
        </div>
        <div className="bg-white border border-[#e6e2d6] rounded-xl px-5 py-4">
          <div className="text-xs font-medium text-[#666d63]">Indian Cuisine</div>
          <div className="font-display text-2xl font-bold text-[#315c43] mt-1 tabular-nums">
            {indianCount}
          </div>
        </div>
        <div className="bg-white border border-[#e6e2d6] rounded-xl px-5 py-4">
          <div className="text-xs font-medium text-[#666d63]">3D Plated Models</div>
          <div className="font-display text-2xl font-bold text-[#c56b34] mt-1 tabular-nums">
            {recipes.length}
          </div>
        </div>
        <div className="bg-white border border-[#e6e2d6] rounded-xl px-5 py-4">
          <div className="text-xs font-medium text-[#666d63]">Saved Favorites</div>
          <div className="font-display text-2xl font-bold text-[#252b25] mt-1 tabular-nums">
            {favorites.length}
          </div>
        </div>
      </div>

      {/* Create / Edit Recipe Drawer Panel */}
      {editorOpen && (
        <form
          onSubmit={handleSaveForm}
          className="bg-white border border-[#e6e2d6] rounded-2xl p-6 space-y-5"
        >
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#ece8dc]">
            <h3 className="font-display text-2xl font-bold text-[#252b25]">
              {form.id !== null ? `Edit Recipe: ${form.name}` : 'Publish New Recipe'}
            </h3>
            <button
              type="button"
              onClick={() => setEditorOpen(false)}
              className="w-8 h-8 rounded-lg border border-[#e6e2d6] flex items-center justify-center text-[#666d63] hover:text-[#252b25] cursor-pointer"
              aria-label="Close recipe editor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {formError && (
            <div className="px-4 py-3 rounded-lg bg-[#e88b52]/12 border border-[#e88b52]/30 text-sm text-[#7f3e16]">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="admin-rec-name" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                Recipe name
              </label>
              <input
                id="admin-rec-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Dal Makhani"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
              />
            </div>

            <div>
              <label htmlFor="admin-rec-cat" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                Category
              </label>
              <select
                id="admin-rec-cat"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
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
              <label htmlFor="admin-rec-cuisine" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                Cuisine
              </label>
              <input
                id="admin-rec-cuisine"
                value={form.cuisine}
                onChange={(e) => setForm((f) => ({ ...f, cuisine: e.target.value }))}
                placeholder="e.g. Indian"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
              />
            </div>

            <div>
              <label htmlFor="admin-rec-time" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                Preparation time
              </label>
              <input
                id="admin-rec-time"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                placeholder="e.g. 35 min"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
              />
            </div>

            <div>
              <label htmlFor="admin-rec-kcal" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                Calories (kcal / serving)
              </label>
              <input
                id="admin-rec-kcal"
                type="number"
                min={0}
                step={5}
                value={form.kcal}
                onChange={(e) => setForm((f) => ({ ...f, kcal: e.target.value }))}
                placeholder="e.g. 350"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm tabular-nums focus:outline-2 focus:outline-[#315c43]"
              />
            </div>

            <div>
              <label htmlFor="admin-rec-preset" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                3D Model &amp; Photo Style
              </label>
              <select
                id="admin-rec-preset"
                value={form.dishModelKey || ''}
                onChange={(e) => {
                  const key = e.target.value as DishModelKey | '';
                  const preset = PHOTO_PRESETS.find((p) => p.key === key);
                  setForm((f) => ({
                    ...f,
                    dishModelKey: key || undefined,
                    image: preset ? preset.url : f.image,
                  }));
                }}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
              >
                <option value="">Auto-detect from name</option>
                {PHOTO_PRESETS.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="admin-rec-image" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                Image URL (optional)
              </label>
              <input
                id="admin-rec-image"
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                placeholder="Auto-filled from preset or paste URL"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <span className="block text-xs font-semibold text-[#555c52] mb-2">
                Dietary Tags
              </span>
              <div className="flex flex-wrap gap-2">
                {DIETARY_TAGS.map((tag) => {
                  const selected = form.dietary.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleFormDietary(tag)}
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

            <div className="sm:col-span-2 lg:col-span-4">
              <label htmlFor="admin-rec-desc" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                Short description
              </label>
              <textarea
                id="admin-rec-desc"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief editorial summary of the dish..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="admin-rec-ing" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                Ingredients (comma-separated)
              </label>
              <textarea
                id="admin-rec-ing"
                rows={3}
                value={form.ingredients}
                onChange={(e) => setForm((f) => ({ ...f, ingredients: e.target.value }))}
                placeholder="Black lentils, butter, cream, ginger, tomatoes..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="admin-rec-steps" className="block text-xs font-semibold text-[#555c52] mb-1.5">
                Preparation steps
              </label>
              <textarea
                id="admin-rec-steps"
                rows={3}
                value={form.steps}
                onChange={(e) => setForm((f) => ({ ...f, steps: e.target.value }))}
                placeholder="1. Soak and simmer... 2. Temper spices..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm focus:outline-2 focus:outline-[#315c43]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#315c43] hover:bg-[#244632] text-white text-sm font-bold cursor-pointer transition-colors"
            >
              {form.id !== null ? 'Save Changes' : 'Publish Recipe'}
            </button>
            <button
              type="button"
              onClick={() => setEditorOpen(false)}
              className="px-5 py-2.5 rounded-lg border border-[#e6e2d6] bg-white text-sm font-semibold text-[#666d63] hover:text-[#252b25] cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search & Filter Toolbar + Data Table */}
      <div className="bg-white border border-[#e6e2d6] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#ece8dc] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'Indian', 'Breakfast', 'Lunch', 'Dinner', 'Desserts', 'Drinks', 'Snacks'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  categoryFilter === cat
                    ? 'bg-[#315c43] text-white'
                    : 'bg-[#fbf8f1] text-[#555c52] hover:bg-[#f0ece0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#666d63] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter catalog..."
              aria-label="Filter recipes in admin catalog"
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#e6e2d6] bg-[#fbf8f1] text-sm focus:outline-2 focus:outline-[#315c43]"
            />
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-[#252b25] mb-1">No matching recipes</p>
            <p className="text-xs text-[#666d63] mb-4">
              Adjust your search filter or add a new recipe.
            </p>
            <button
              type="button"
              onClick={openCreateForm}
              className="px-4 py-2 rounded-lg bg-[#315c43] text-white text-xs font-bold cursor-pointer"
            >
              Add Recipe
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#ece8dc] bg-[#fbf8f1] text-[11px] font-bold tracking-wider text-[#666d63]">
                  <th className="py-3 px-4">Dish</th>
                  <th className="py-3 px-4">Cuisine</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Calories</th>
                  <th className="py-3 px-4 text-right">Prep Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece8dc] text-sm">
                {filteredRows.map((r) => (
                  <tr key={r.id} className="hover:bg-[#fbf8f1]/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-9 rounded-md overflow-hidden bg-[#efe9dc] shrink-0">
                          <ResilientImage
                            src={r.image}
                            alt={r.name}
                            title={r.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-[#252b25] whitespace-nowrap">
                            {r.name}
                          </div>
                          {r.dietary && r.dietary.length > 0 && (
                            <div className="text-[11px] text-[#666d63] whitespace-nowrap">
                              {r.dietary.slice(0, 3).join(' · ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#555c52] whitespace-nowrap">
                      {r.cuisine || 'Classic'}
                    </td>
                    <td className="py-3 px-4 text-[#555c52] whitespace-nowrap">{r.category}</td>
                    <td className="py-3 px-4 text-right font-semibold text-[#c56b34] tabular-nums whitespace-nowrap">
                      {r.kcal} kcal
                    </td>
                    <td className="py-3 px-4 text-right text-[#555c52] tabular-nums whitespace-nowrap">
                      {r.time}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewRecipe(r.id)}
                          title="View recipe details"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#e6e2d6] text-xs font-semibold text-[#315c43] hover:bg-[#fbf8f1] cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpen3D(r.id)}
                          title="Inspect 3D dish model"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#e6e2d6] text-xs font-semibold text-[#252b25] hover:bg-[#fbf8f1] cursor-pointer"
                        >
                          <Box className="w-3.5 h-3.5" />
                          <span>3D</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditForm(r)}
                          title="Edit recipe"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#e6e2d6] text-xs font-semibold text-[#c56b34] hover:bg-[#fbf8f1] cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {confirmDeleteId === r.id ? (
                          <div className="inline-flex items-center gap-1 ml-1">
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteRecipe(r.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-1 rounded bg-[#b93829] text-white text-xs font-semibold cursor-pointer"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded text-xs font-semibold text-[#666d63] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(r.id)}
                            title="Delete recipe"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#e6e2d6] text-xs font-semibold text-[#b93829] hover:bg-[#fdf2f0] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
