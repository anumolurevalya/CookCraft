import { useState } from 'react';
import {
  DIETARY_TAGS,
  FALLBACK_RECIPE_IMAGES,
  type DietaryTag,
  type Recipe,
  type UserSession,
} from '../data/recipes';

interface ShareRecipeViewProps {
  user: UserSession | null;
  onAddRecipe: (recipe: Recipe) => void;
  onRequireAdmin: () => void;
  onPublished: () => void;
}

export default function ShareRecipeView({
  user,
  onAddRecipe,
  onRequireAdmin,
  onPublished,
}: ShareRecipeViewProps) {
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

  const toggleDietary = (tag: DietaryTag) => {
    setNewDietary((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== 'admin') {
      setShareFeedback('Please sign in as Admin first to publish a recipe.');
      onRequireAdmin();
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

    onAddRecipe({
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
    onPublished();
  };

  return (
    <section className="bg-white border border-[#e6e2d6] rounded-2xl p-6 md:p-8 max-w-3xl mx-auto">
      <h2 className="font-display text-3xl font-bold text-[#252b25] mb-2">
        Share a Recipe
      </h2>
      <p className="text-sm text-[#666d63] mb-6">
        {user?.role === 'admin' ? (
          'Admin access enabled. Add a new dish to the RecipeHub collection below.'
        ) : (
          <>
            Sign in as Admin (<span className="font-semibold text-[#252b25]">admin / admin123</span>)
            to add recipes in this demo.{' '}
            <button
              type="button"
              onClick={onRequireAdmin}
              className="font-bold text-[#315c43] underline cursor-pointer"
            >
              Go to Login Module
            </button>
          </>
        )}
      </p>

      {shareFeedback && (
        <div
          role="alert"
          className="mb-5 px-4 py-3 rounded-lg bg-[#e88b52]/12 border border-[#e88b52]/30 text-sm text-[#7f3e16]"
        >
          {shareFeedback}
        </div>
      )}

      <form onSubmit={handlePublish}>
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
                    onClick={() => toggleDietary(tag)}
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
          type="submit"
          className="px-6 py-3 rounded-lg bg-[#315c43] hover:bg-[#244632] text-white text-sm font-bold cursor-pointer transition-colors"
        >
          Publish Recipe
        </button>
      </form>
    </section>
  );
}
