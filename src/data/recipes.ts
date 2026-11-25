export type RecipeCategory =
  | 'Breakfast'
  | 'Lunch'
  | 'Dinner'
  | 'Desserts'
  | 'Drinks'
  | 'Snacks'
  | 'Other';

export type DietaryTag =
  | 'Vegetarian'
  | 'Vegan'
  | 'Gluten-Free'
  | 'High-Protein'
  | 'Dairy-Free'
  | 'Low-Calorie';

export const DIETARY_TAGS: DietaryTag[] = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'High-Protein',
  'Dairy-Free',
  'Low-Calorie',
];

export type DishModelKey =
  | 'pasta'
  | 'dosa'
  | 'salad'
  | 'pancakes'
  | 'pizza'
  | 'curry'
  | 'paneer_butter_masala'
  | 'biryani'
  | 'idli_sambar'
  | 'chole_bhature'
  | 'palak_paneer'
  | 'aloo_paratha'
  | 'poha'
  | 'avocado_toast'
  | 'rajma_chawal'
  | 'falafel_bowl'
  | 'dal_makhani'
  | 'risotto'
  | 'samosa_chaat'
  | 'gulab_jamun'
  | 'pav_bhaji'
  | 'paneer_tikka'
  | 'mango_lassi'
  | 'tiramisu'
  | 'rasmalai'
  | 'gajar_halwa'
  | 'lava_cake'
  | 'masala_chai'
  | 'nimbu_pani'
  | 'matcha_latte';

export interface Recipe {
  id: number;
  name: string;
  category: string;
  cuisine?: string;
  time: string;
  kcal: number;
  dietary: DietaryTag[];
  description: string;
  ingredients: string;
  steps: string;
  image: string;
  dishModelKey?: DishModelKey;
}

export interface UserSession {
  name: string;
  role: 'user' | 'admin';
}

export interface RegisteredUser {
  username: string;
  password: string;
  displayName: string;
  role: 'user' | 'admin';
}

export const HERO_IMAGE = '/src/assets/images/hero_culinary_table_1795627817654.jpg';

export const FALLBACK_RECIPE_IMAGES: Record<string, string> = {
  pasta: '/src/assets/images/dish_garlic_pasta_1795627820274.jpg',
  dosa: '/src/assets/images/dish_masala_dosa_1795627821701.jpg',
  salad: '/src/assets/images/dish_garden_salad_1795627821498.jpg',
  pancakes: '/src/assets/images/dish_fluffy_pancakes_1795627821940.jpg',
  pizza: '/src/assets/images/dish_homemade_pizza_1795627822548.jpg',
  curry: '/src/assets/images/dish_chickpea_curry_1795627823212.jpg',
  paneer_butter_masala: '/src/assets/images/dish_paneer_butter_masala_1795628257958.jpg',
  biryani: '/src/assets/images/dish_chicken_biryani_1795628258013.jpg',
  idli_sambar: '/src/assets/images/dish_idli_sambar_1795628257417.jpg',
  chole_bhature: '/src/assets/images/dish_chole_bhature_1795628257907.jpg',
  palak_paneer: '/src/assets/images/dish_palak_paneer_1795628258729.jpg',
  aloo_paratha: '/src/assets/images/dish_aloo_paratha_1795628258383.jpg',
  poha: '/src/assets/images/dish_kanda_poha_1795630903899.jpg',
  avocado_toast: '/src/assets/images/dish_avocado_toast_1795630904648.jpg',
  rajma_chawal: '/src/assets/images/dish_rajma_chawal_1795630905595.jpg',
  falafel_bowl: '/src/assets/images/dish_falafel_bowl_1795630906206.jpg',
  dal_makhani: '/src/assets/images/dish_dal_makhani_1795630906068.jpg',
  risotto: '/src/assets/images/dish_mushroom_risotto_1795630907470.jpg',
  samosa_chaat: '/src/assets/images/dish_samosa_chaat_1795630908045.jpg',
  gulab_jamun: '/src/assets/images/dish_gulab_jamun_1795630907025.jpg',
  pav_bhaji: '/src/assets/images/dish_pav_bhaji_1795630907140.jpg',
  paneer_tikka: '/src/assets/images/dish_paneer_tikka_1795630907913.jpg',
  mango_lassi: '/src/assets/images/dish_mango_lassi_1795630909577.jpg',
  tiramisu: '/src/assets/images/dish_espresso_tiramisu_1795630909295.jpg',
  rasmalai: '/src/assets/images/dish_rasmalai_1795632898905.jpg',
  gajar_halwa: '/src/assets/images/dish_gajar_halwa_1795632898166.jpg',
  lava_cake: '/src/assets/images/dish_lava_cake_1795632898872.jpg',
  masala_chai: '/src/assets/images/dish_masala_chai_1795632900224.jpg',
  nimbu_pani: '/src/assets/images/dish_nimbu_pani_1795632899347.jpg',
  matcha_latte: '/src/assets/images/dish_matcha_latte_1795632901225.jpg',
};

export const STARTER_RECIPES: Recipe[] = [
  {
    id: 1,
    name: 'Creamy Garlic Pasta',
    category: 'Dinner',
    cuisine: 'Italian',
    time: '25 min',
    kcal: 560,
    dietary: ['Vegetarian'],
    description: 'Comforting fettuccine tossed in a rich roasted garlic and parmesan cream sauce with fresh basil.',
    ingredients: 'Pasta, garlic, heavy cream, parmesan, olive oil, fresh basil, cracked black pepper',
    steps: '1. Boil salted water and cook pasta until al dente. 2. Sauté sliced garlic gently in olive oil until fragrant. 3. Pour in cream, whisk in parmesan, and simmer until silky. 4. Fold pasta into the sauce and finish with basil and black pepper.',
    image: FALLBACK_RECIPE_IMAGES.pasta,
    dishModelKey: 'pasta',
  },
  {
    id: 2,
    name: 'Masala Dosa',
    category: 'Breakfast',
    cuisine: 'Indian',
    time: '30 min',
    kcal: 380,
    dietary: ['Vegetarian', 'Gluten-Free'],
    description: 'Crisp fermented rice-lentil crepe filled with warmly spiced potato masala, coconut chutney, and sambar.',
    ingredients: 'Dosa batter, potatoes, yellow onion, mustard seeds, curry leaves, turmeric, coconut chutney',
    steps: '1. Temper mustard seeds, curry leaves, and onions in oil, then fold in mashed turmeric potatoes. 2. Ladle dosa batter onto a hot griddle and spiral outward thin. 3. Drizzle ghee around edges until golden crisp. 4. Spoon potato masala inside, fold, and serve with chutney and sambar.',
    image: FALLBACK_RECIPE_IMAGES.dosa,
    dishModelKey: 'dosa',
  },
  {
    id: 7,
    name: 'Paneer Butter Masala',
    category: 'Dinner',
    cuisine: 'Indian',
    time: '35 min',
    kcal: 495,
    dietary: ['Vegetarian', 'High-Protein'],
    description: 'Soft seared paneer cubes simmered in a velvety tomato, butter, and cashew makhani gravy finished with kasuri methi.',
    ingredients: 'Fresh paneer, ripe tomatoes, raw cashews, cultured butter, ginger-garlic paste, Kashmiri chili, garam masala, heavy cream, kasuri methi, garlic naan',
    steps: '1. Simmer tomatoes, cashews, and ginger-garlic until soft, then blend into a silky puree. 2. Melt butter in a kadai, bloom Kashmiri chili and garam masala, and strain in the puree. 3. Simmer 12 minutes until glossy, fold in seared paneer cubes and cream. 4. Crush roasted kasuri methi on top and serve with warm garlic naan.',
    image: FALLBACK_RECIPE_IMAGES.paneer_butter_masala,
    dishModelKey: 'paneer_butter_masala',
  },
  {
    id: 8,
    name: 'Hyderabadi Chicken Biryani',
    category: 'Dinner',
    cuisine: 'Indian',
    time: '55 min',
    kcal: 620,
    dietary: ['Gluten-Free', 'High-Protein'],
    description: 'Aromatic dum-cooked basmati rice layered with spiced marinated chicken, saffron milk, crispy fried onions, and fresh mint.',
    ingredients: 'Aged basmati rice, chicken thighs, thick yogurt, saffron strands, caramelized onions, fresh mint, cilantro, whole garam masala, ghee, cucumber raita',
    steps: '1. Marinate chicken in spiced yogurt, ginger-garlic, mint, and half the crispy fried onions. 2. Parboil soaked basmati rice with whole cardamom, bay leaf, and cloves until 70% tender. 3. Layer marinated chicken and rice in a heavy clay handi, drizzling saffron milk and ghee on top. 4. Seal and dum-cook on low heat for 25 minutes, then serve with cool cucumber raita.',
    image: FALLBACK_RECIPE_IMAGES.biryani,
    dishModelKey: 'biryani',
  },
  {
    id: 9,
    name: 'Idli Sambar',
    category: 'Breakfast',
    cuisine: 'Indian',
    time: '25 min',
    kcal: 290,
    dietary: ['Vegetarian', 'Gluten-Free', 'Low-Calorie'],
    description: 'Pillow-soft steamed fermented rice and urad dal cakes paired with tangy drumstick vegetable sambar and coconut chutney.',
    ingredients: 'Idli batter, toor dal, tamarind pulp, drumsticks, shallots, sambar powder, grated coconut, mustard seeds, curry leaves, ghee',
    steps: '1. Steam fermented idli batter in greased moulds for 10 minutes until springy and light. 2. Simmer cooked toor dal with tamarind water, vegetables, and aromatic sambar powder. 3. Temper mustard seeds, curry leaves, and dried red chilies in oil over the sambar and freshly ground coconut chutney. 4. Serve hot idlis with a drizzle of ghee and podi spice.',
    image: FALLBACK_RECIPE_IMAGES.idli_sambar,
    dishModelKey: 'idli_sambar',
  },
  {
    id: 10,
    name: 'Punjabi Chole Bhature',
    category: 'Lunch',
    cuisine: 'Indian',
    time: '45 min',
    kcal: 640,
    dietary: ['Vegetarian', 'High-Protein'],
    description: 'Bold, tangy dark-spiced chickpea chole simmered with roasted spices and served alongside puffy golden bhature.',
    ingredients: 'Kabuli chickpeas, tea bag for colour, tomatoes, ginger juliennes, amchur, chana masala, all-purpose flour, yogurt, pickled red onions',
    steps: '1. Pressure-cook soaked chickpeas with whole spices until tender and deep amber. 2. Sauté onions, ginger-garlic, and tomatoes with roasted cumin, coriander, and amchur, then simmer chickpeas until thick. 3. Knead soft yogurt-leavened dough, rest, roll into discs, and deep-fry until puffed and golden. 4. Plate hot with ginger juliennes and pickled onions.',
    image: FALLBACK_RECIPE_IMAGES.chole_bhature,
    dishModelKey: 'chole_bhature',
  },
  {
    id: 11,
    name: 'Palak Paneer',
    category: 'Lunch',
    cuisine: 'Indian',
    time: '30 min',
    kcal: 360,
    dietary: ['Vegetarian', 'Gluten-Free', 'High-Protein'],
    description: 'Vibrant emerald spinach puree infused with roasted garlic-cumin tempering and tender golden paneer cubes.',
    ingredients: 'Fresh baby spinach, paneer cubes, garlic cloves, green chili, cumin seeds, ginger, garam masala, fresh cream, tandoori roti',
    steps: '1. Blanch fresh spinach briefly and plunge into ice water to lock in bright green colour, then blend smooth. 2. Toast cumin seeds and sliced garlic in ghee, sautéing onions and spices. 3. Pour in the spinach puree, simmer gently for 6 minutes, and fold in lightly browned paneer cubes. 4. Swirl with cream and serve with warm tandoori roti.',
    image: FALLBACK_RECIPE_IMAGES.palak_paneer,
    dishModelKey: 'palak_paneer',
  },
  {
    id: 12,
    name: 'Aloo Paratha',
    category: 'Breakfast',
    cuisine: 'Indian',
    time: '25 min',
    kcal: 420,
    dietary: ['Vegetarian'],
    description: 'Flaky whole-wheat flatbread stuffed with cumin-spiced mashed potatoes, blistered in ghee and crowned with white butter.',
    ingredients: 'Whole wheat flour, boiled potatoes, green chilies, fresh cilantro, roasted cumin, ajwain, ghee, white makkhan butter, yogurt curd, mango pickle',
    steps: '1. Mash boiled potatoes with chopped cilantro, green chilies, roasted cumin, amchur, and salt. 2. Stuff spiced potato filling inside whole-wheat dough balls and roll evenly. 3. Griddle on a hot tawa, brushing both sides with ghee until golden-blistered. 4. Top with melting butter and serve with cool curd and mango pickle.',
    image: FALLBACK_RECIPE_IMAGES.aloo_paratha,
    dishModelKey: 'aloo_paratha',
  },
  {
    id: 3,
    name: 'Fresh Garden Salad',
    category: 'Lunch',
    cuisine: 'Mediterranean',
    time: '15 min',
    kcal: 180,
    dietary: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Low-Calorie'],
    description: 'A crisp, colourful bowl of butter lettuce, cucumber rounds, cherry tomatoes, red onion, and lemon dressing.',
    ingredients: 'Butter lettuce, English cucumber, cherry tomatoes, red onion, fresh lemon, extra-virgin olive oil, sea salt',
    steps: '1. Wash and crisp the lettuce leaves, then slice cucumbers, tomatoes, and red onion thinly. 2. Whisk fresh lemon juice with extra-virgin olive oil and flaky sea salt. 3. Toss gently right before plating and garnish with a bright lemon wedge.',
    image: FALLBACK_RECIPE_IMAGES.salad,
    dishModelKey: 'salad',
  },
  {
    id: 4,
    name: 'Fluffy Pancakes',
    category: 'Breakfast',
    cuisine: 'American',
    time: '20 min',
    kcal: 430,
    dietary: ['Vegetarian'],
    description: 'Tall, golden griddle-toasted pancakes stacked with melting butter, warm maple syrup, and fresh blueberries.',
    ingredients: 'All-purpose flour, whole milk, free-range egg, baking powder, cane sugar, cultured butter, maple syrup, blueberries',
    steps: '1. Whisk dry ingredients together, then fold in milk, beaten egg, and melted butter without overmixing. 2. Ladle onto a medium-low buttered griddle until bubbles form and set. 3. Flip once and cook until deep golden. 4. Stack high with butter, blueberries, and maple syrup.',
    image: FALLBACK_RECIPE_IMAGES.pancakes,
    dishModelKey: 'pancakes',
  },
  {
    id: 5,
    name: 'Homemade Pizza',
    category: 'Dinner',
    cuisine: 'Italian',
    time: '40 min',
    kcal: 520,
    dietary: ['Vegetarian'],
    description: 'Wood-fired style blistered crust topped with crushed tomato sauce, fresh mozzarella, and sweet basil leaves.',
    ingredients: 'Artisan pizza dough, crushed San Marzano tomatoes, fresh mozzarella, basil leaves, olive oil, sea salt',
    steps: '1. Stretch rested dough gently onto a dusted wooden peel without flattening the rim. 2. Spoon crushed tomato sauce thinly across the center and tear fresh mozzarella over top. 3. Bake on a blazing stone until blistered and golden. 4. Finish with fresh basil and olive oil.',
    image: FALLBACK_RECIPE_IMAGES.pizza,
    dishModelKey: 'pizza',
  },
  {
    id: 6,
    name: 'Indian Chickpea Curry',
    category: 'Lunch',
    cuisine: 'Indian',
    time: '35 min',
    kcal: 410,
    dietary: ['Vegetarian', 'Vegan', 'Dairy-Free', 'High-Protein'],
    description: 'A hearty spiced chickpea masala simmered in roasted tomato gravy, served with basmati rice and warm naan.',
    ingredients: 'Chickpeas, ripe tomatoes, onion, garlic, ginger, garam masala, cumin, cilantro, basmati rice, naan',
    steps: '1. Caramelize diced onions with ginger and garlic, then bloom cumin and garam masala. 2. Stir in crushed tomatoes and simmer into a glossy masala base. 3. Fold in chickpeas and simmer 15 minutes until rich. 4. Garnish with cilantro and serve with basmati rice and naan.',
    image: FALLBACK_RECIPE_IMAGES.curry,
    dishModelKey: 'curry',
  },
  {
    id: 13,
    name: 'Kanda Poha',
    category: 'Breakfast',
    cuisine: 'Indian',
    time: '20 min',
    kcal: 275,
    dietary: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Low-Calorie'],
    description: 'Light, fluffy turmeric flattened rice tempered with mustard seeds, curry leaves, caramelized onions, roasted peanuts, and crisp sev.',
    ingredients: 'Thick poha flakes, yellow onions, roasted peanuts, mustard seeds, curry leaves, turmeric, green chilies, pomegranate seeds, crispy sev, lemon juice, cilantro',
    steps: '1. Rinse thick poha gently in a colander and drain so the flakes stay fluffy and separate. 2. Crackle mustard seeds, curry leaves, green chilies, and peanuts in warm oil, then sauté sliced onions until golden. 3. Stir in turmeric and salt, fold in the damp poha, and steam covered for 3 minutes. 4. Garnish with crispy sev, pomegranate seeds, fresh cilantro, and a squeeze of lemon.',
    image: FALLBACK_RECIPE_IMAGES.poha,
    dishModelKey: 'poha',
  },
  {
    id: 14,
    name: 'Avocado Poached Egg Toast',
    category: 'Breakfast',
    cuisine: 'American',
    time: '15 min',
    kcal: 390,
    dietary: ['Vegetarian', 'Dairy-Free', 'High-Protein'],
    description: 'Thick-cut toasted sourdough layered with lemon-herb smashed avocado, soft poached eggs, chili flakes, and microgreens.',
    ingredients: 'Sourdough bread, ripe avocados, free-range eggs, lemon juice, red chili flakes, toasted sesame seeds, microgreens, flaky sea salt, olive oil',
    steps: '1. Toast thick sourdough slices until deeply golden and crisp at the edges. 2. Smash ripe avocado with fresh lemon juice, olive oil, and flaky sea salt. 3. Poach eggs in gently simmering water with a splash of vinegar for 3 minutes until whites set. 4. Spread avocado over warm toast, top with poached eggs, chili flakes, sesame seeds, and microgreens.',
    image: FALLBACK_RECIPE_IMAGES.avocado_toast,
    dishModelKey: 'avocado_toast',
  },
  {
    id: 15,
    name: 'Rajma Chawal',
    category: 'Lunch',
    cuisine: 'Indian',
    time: '45 min',
    kcal: 460,
    dietary: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'High-Protein'],
    description: 'Homestyle Punjabi red kidney beans slow-simmered in a spiced tomato-ginger gravy, served alongside cumin-scented basmati rice.',
    ingredients: 'Red kidney beans, aged basmati rice, vine tomatoes, yellow onions, ginger juliennes, garlic, Kashmiri chili, garam masala, cumin seeds, fresh cilantro, pickled red onions',
    steps: '1. Soak kidney beans overnight and pressure-cook with black cardamom and bay leaf until velvety soft. 2. Sauté finely chopped onions, ginger-garlic, and pureed tomatoes with cumin, coriander, and Kashmiri chili until oil separates. 3. Simmer cooked rajma in the masala for 20 minutes, mashing a few beans to thicken the gravy. 4. Serve piping hot over steamed jeera basmati rice with ginger juliennes and pickled onions.',
    image: FALLBACK_RECIPE_IMAGES.rajma_chawal,
    dishModelKey: 'rajma_chawal',
  },
  {
    id: 16,
    name: 'Crispy Falafel Mezze Bowl',
    category: 'Lunch',
    cuisine: 'Mediterranean',
    time: '30 min',
    kcal: 440,
    dietary: ['Vegetarian', 'High-Protein'],
    description: 'Herb-packed crispy chickpea falafel nestled over creamy tahini hummus, cucumber-tomato salad, pickled turnips, and warm pita.',
    ingredients: 'Soaked chickpeas, fresh parsley, cilantro, garlic, cumin, creamy tahini hummus, English cucumber, cherry tomatoes, pickled turnips, warm pita triangles, extra-virgin olive oil',
    steps: '1. Pulse soaked raw chickpeas with parsley, cilantro, onion, garlic, and cumin into a coarse green meal, then shape into balls and fry until crisp. 2. Swirl silky hummus onto the side of a wide stoneware bowl and drizzle with olive oil and paprika. 3. Arrange diced cucumber-tomato salad, pickled turnips, and toasted pita wedges alongside. 4. Crown with warm falafel and a dollop of herbed yogurt.',
    image: FALLBACK_RECIPE_IMAGES.falafel_bowl,
    dishModelKey: 'falafel_bowl',
  },
  {
    id: 17,
    name: 'Slow-Simmered Dal Makhani',
    category: 'Dinner',
    cuisine: 'Indian',
    time: '55 min',
    kcal: 470,
    dietary: ['Vegetarian', 'Gluten-Free', 'High-Protein'],
    description: 'Whole black urad lentils simmered slowly with vine tomatoes, cultured butter, ginger, and cream, served with jeera rice and naan.',
    ingredients: 'Whole black urad dal, red kidney beans, tomato puree, cultured butter, heavy cream, ginger-garlic paste, Kashmiri chili, kasuri methi, cumin basmati rice, garlic naan',
    steps: '1. Soak black urad dal and a handful of rajma overnight, then simmer gently until creamy and tender. 2. Bloom ginger-garlic paste and Kashmiri chili in butter, add tomato puree, and cook until glossy. 3. Fold in the cooked lentils and simmer on low heat for 25 minutes, stirring in butter and crushed kasuri methi. 4. Finish with a swirl of cream and serve with jeera rice and warm naan.',
    image: FALLBACK_RECIPE_IMAGES.dal_makhani,
    dishModelKey: 'dal_makhani',
  },
  {
    id: 18,
    name: 'Creamy Mushroom Risotto',
    category: 'Dinner',
    cuisine: 'Italian',
    time: '40 min',
    kcal: 485,
    dietary: ['Vegetarian', 'Gluten-Free'],
    description: 'Velvety Arborio rice gently ladled with warm herb broth and folded with golden seared cremini mushrooms, parmesan, and thyme.',
    ingredients: 'Arborio rice, cremini mushrooms, shallots, garlic, warm vegetable stock, unsalted butter, Parmigiano-Reggiano, fresh thyme, extra-virgin olive oil, black pepper',
    steps: '1. Sear sliced cremini mushrooms in olive oil and butter with thyme until deeply browned, then set aside. 2. Sweat minced shallots and toast Arborio rice for 2 minutes until translucent at the edges. 3. Add warm stock one ladle at a time, stirring gently until creamy and al dente. 4. Fold in butter, grated parmesan, and seared mushrooms off the heat and garnish with parmesan curls.',
    image: FALLBACK_RECIPE_IMAGES.risotto,
    dishModelKey: 'risotto',
  },
  {
    id: 19,
    name: 'Punjabi Samosa Chaat',
    category: 'Snacks',
    cuisine: 'Indian',
    time: '25 min',
    kcal: 395,
    dietary: ['Vegetarian'],
    description: 'Crisp spiced potato samosas crushed and layered with cool yogurt, tangy tamarind chutney, mint chutney, pomegranate, and sev.',
    ingredients: 'Crispy potato samosas, spiced chickpea chole, whisked yogurt, tamarind-date chutney, green mint-cilantro chutney, chaat masala, crispy nylon sev, pomegranate arils, fresh cilantro',
    steps: '1. Lightly crush warm, flaky potato samosas onto a shallow serving platter and spoon hot chole over the base. 2. Drizzle generously with chilled sweetened yogurt, tangy tamarind chutney, and bright green mint chutney. 3. Dust with roasted cumin powder and chaat masala. 4. Finish with a generous handful of crunchy sev, ruby pomegranate seeds, and chopped cilantro.',
    image: FALLBACK_RECIPE_IMAGES.samosa_chaat,
    dishModelKey: 'samosa_chaat',
  },
  {
    id: 21,
    name: 'Mumbai Pav Bhaji',
    category: 'Snacks',
    cuisine: 'Indian',
    time: '30 min',
    kcal: 450,
    dietary: ['Vegetarian'],
    description: 'Rich butter-mashed spiced vegetable bhaji topped with melting butter and cilantro, served with toasted ladi pav buns and lime.',
    ingredients: 'Potatoes, cauliflower, green peas, tomatoes, bell pepper, Pav Bhaji masala, Kashmiri chili, salted butter, soft ladi pav buns, finely diced red onion, lime wedge, cilantro',
    steps: '1. Boil potatoes, cauliflower, and peas until soft, then mash finely on a wide griddle. 2. Sauté onions, ginger-garlic, bell pepper, and tomatoes in butter with Pav Bhaji masala and Kashmiri chili. 3. Combine mashed vegetables and simmer with a splash of water and extra butter until rich and velvety. 4. Toast split pav buns in spiced butter on the tawa and serve sizzling with diced onions and lime.',
    image: FALLBACK_RECIPE_IMAGES.pav_bhaji,
    dishModelKey: 'pav_bhaji',
  },
  {
    id: 22,
    name: 'Tandoori Paneer Tikka',
    category: 'Snacks',
    cuisine: 'Indian',
    time: '35 min',
    kcal: 340,
    dietary: ['Vegetarian', 'Gluten-Free', 'High-Protein'],
    description: 'Smoky char-grilled paneer cubes marinated in spiced hung yogurt and mustard oil, skewered with sweet bell peppers and red onions.',
    ingredients: 'Firm paneer blocks, thick hung yogurt, bell peppers, red onions, ginger-garlic paste, Kashmiri chili, ajwain, chaat masala, mustard oil, fresh mint chutney, lemon wedges',
    steps: '1. Whisk hung yogurt with mustard oil, Kashmiri chili, turmeric, garam masala, ajwain, and ginger-garlic paste. 2. Coat paneer cubes, bell pepper squares, and onion petals gently and marinate for 30 minutes. 3. Thread onto skewers and char-grill under high heat, brushing with butter until blistered. 4. Dust with chaat masala and serve sizzling with green mint chutney and lemon wedges.',
    image: FALLBACK_RECIPE_IMAGES.paneer_tikka,
    dishModelKey: 'paneer_tikka',
  },
  {
    id: 20,
    name: 'Warm Gulab Jamun',
    category: 'Desserts',
    cuisine: 'Indian',
    time: '35 min',
    kcal: 320,
    dietary: ['Vegetarian'],
    description: 'Melt-in-the-mouth golden khoya milk dumplings steeped in fragrant cardamom, saffron, and rosewater syrup with pistachios.',
    ingredients: 'Milk solids khoya, paneer, all-purpose flour, green cardamom pods, cane sugar, saffron strands, rosewater, ghee, crushed pistachios, dried rose petals',
    steps: '1. Boil sugar and water with crushed cardamom pods, saffron strands, and rosewater into a sticky glossy syrup. 2. Knead smooth khoya, grated paneer, and flour into crack-free dough balls. 3. Fry gently in warm ghee on low heat while swirling continuously until deep golden-brown. 4. Soak in warm saffron-rose syrup for 30 minutes and garnish with pistachios and rose petals.',
    image: FALLBACK_RECIPE_IMAGES.gulab_jamun,
    dishModelKey: 'gulab_jamun',
  },
  {
    id: 24,
    name: 'Classic Espresso Tiramisu',
    category: 'Desserts',
    cuisine: 'Italian',
    time: '30 min',
    kcal: 415,
    dietary: ['Vegetarian'],
    description: 'Layers of espresso-dipped savoiardi ladyfingers and whipped mascarpone cream dusted generously with dark Dutch cocoa.',
    ingredients: 'Savoiardi ladyfingers, chilled mascarpone cheese, heavy whipping cream, freshly brewed espresso, egg yolks, caster sugar, vanilla extract, dark cocoa powder',
    steps: '1. Whisk egg yolks and sugar over gentle heat until pale and thick, then cool and fold into creamy mascarpone and softly whipped cream. 2. Dip savoiardi ladyfingers briefly into cooled strong espresso without oversoaking. 3. Layer soaked biscuits and mascarpone cream evenly in a chilled dish and refrigerate 4 hours to set. 4. Dust generously with dark cocoa powder right before slicing.',
    image: FALLBACK_RECIPE_IMAGES.tiramisu,
    dishModelKey: 'tiramisu',
  },
  {
    id: 25,
    name: 'Saffron Pistachio Rasmalai',
    category: 'Desserts',
    cuisine: 'Indian',
    time: '40 min',
    kcal: 310,
    dietary: ['Vegetarian', 'Gluten-Free'],
    description: 'Spongy homemade paneer patties steeped in chilled saffron-cardamom rabri milk and crowned with slivered pistachios and rose petals.',
    ingredients: 'Whole milk, lemon juice, cane sugar, saffron strands, green cardamom, slivered pistachios, dried rose petals, kewra water',
    steps: '1. Curdle whole milk with lemon juice, drain, and knead fresh chhena until silky smooth, then shape into flat discs. 2. Simmer discs in boiling light sugar syrup covered for 12 minutes until doubled in size and spongy. 3. Reduce whole milk with saffron, sugar, and cardamom into creamy rabri. 4. Squeeze syrup gently from discs, soak in chilled saffron milk, and garnish with pistachios.',
    image: FALLBACK_RECIPE_IMAGES.rasmalai,
    dishModelKey: 'rasmalai',
  },
  {
    id: 26,
    name: 'Gajar Ka Halwa',
    category: 'Desserts',
    cuisine: 'Indian',
    time: '45 min',
    kcal: 340,
    dietary: ['Vegetarian', 'Gluten-Free'],
    description: 'Slow-braised red winter carrots simmered in whole milk, ghee, and cardamom, topped with roasted cashews, almonds, and pistachios.',
    ingredients: 'Red carrots, whole milk, cultured ghee, khoya, cane sugar, green cardamom powder, roasted cashews, slivered almonds, pistachios',
    steps: '1. Grate sweet red carrots finely and sauté in warm ghee for 6 minutes until aromatic. 2. Pour in whole milk and simmer gently, stirring occasionally until milk reduces and coats the carrots. 3. Stir in sugar, crumbled khoya, and freshly crushed cardamom until glossy. 4. Top generously with ghee-toasted cashews, almonds, and pistachios.',
    image: FALLBACK_RECIPE_IMAGES.gajar_halwa,
    dishModelKey: 'gajar_halwa',
  },
  {
    id: 27,
    name: 'Molten Chocolate Lava Cake',
    category: 'Desserts',
    cuisine: 'French',
    time: '25 min',
    kcal: 410,
    dietary: ['Vegetarian'],
    description: 'Warm bittersweet dark chocolate sponge with a rich flowing ganache center, dusted with powdered sugar and fresh raspberries.',
    ingredients: '70% dark chocolate, unsalted butter, free-range eggs, egg yolks, caster sugar, all-purpose flour, espresso pinch, powdered sugar, fresh raspberries',
    steps: '1. Melt dark chocolate and unsalted butter together until glossy, then whisk in a pinch of espresso and salt. 2. Beat whole eggs, yolks, and sugar until pale and ribbony, then fold gently into the warm chocolate. 3. Fold in flour and divide into buttered, cocoa-dusted ramekins. 4. Bake 11 minutes until edges set while the center stays molten, invert onto plates, and garnish with berries.',
    image: FALLBACK_RECIPE_IMAGES.lava_cake,
    dishModelKey: 'lava_cake',
  },
  {
    id: 23,
    name: 'Alphonso Mango Lassi',
    category: 'Drinks',
    cuisine: 'Indian',
    time: '10 min',
    kcal: 230,
    dietary: ['Vegetarian', 'Gluten-Free', 'Low-Calorie'],
    description: 'Chilled, velvety yogurt smoothie blended with sweet Alphonso mango pulp, aromatic green cardamom, saffron, and crushed pistachios.',
    ingredients: 'Ripe Alphonso mango pulp, thick chilled yogurt, whole milk, honey or raw sugar, green cardamom powder, saffron strands, crushed pistachios, fresh mint sprigs',
    steps: '1. Chill thick whole-milk yogurt and ripe Alphonso mango cubes before blending. 2. Blend mango, yogurt, a splash of milk, honey, and freshly ground cardamom until ultra-silky and frothy. 3. Pour into chilled tall glasses over a few ice cubes if desired. 4. Top with crushed green pistachios, saffron strands, and a fresh mint sprig.',
    image: FALLBACK_RECIPE_IMAGES.mango_lassi,
    dishModelKey: 'mango_lassi',
  },
  {
    id: 28,
    name: 'Spiced Mumbai Masala Chai',
    category: 'Drinks',
    cuisine: 'Indian',
    time: '12 min',
    kcal: 110,
    dietary: ['Vegetarian', 'Gluten-Free', 'Low-Calorie'],
    description: 'Robust Assam black tea simmered with crushed fresh ginger, green cardamom, cinnamon, and whole milk, poured into warm clay kulhads.',
    ingredients: 'Assam CTC black tea, fresh ginger root, green cardamom pods, cinnamon stick, star anise, whole milk, raw cane sugar, water',
    steps: '1. Crush fresh ginger, green cardamom pods, and cinnamon in a mortar until fragrant. 2. Simmer spices in water for 3 minutes before adding Assam tea leaves and boiling briskly. 3. Pour in whole milk and sugar, simmering until rich caramel-amber and frothy. 4. Strain hot into terracotta kulhad cups and serve immediately.',
    image: FALLBACK_RECIPE_IMAGES.masala_chai,
    dishModelKey: 'masala_chai',
  },
  {
    id: 29,
    name: 'Fresh Mint Nimbu Pani',
    category: 'Drinks',
    cuisine: 'Indian',
    time: '8 min',
    kcal: 65,
    dietary: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Low-Calorie'],
    description: 'Sparkling chilled limeade muddled with garden mint, roasted cumin powder, kala namak black salt, and crisp lime wheels.',
    ingredients: 'Fresh limes, garden mint leaves, roasted cumin powder, kala namak black salt, organic cane sugar, chilled sparkling water, ice cubes',
    steps: '1. Rim chilled tall glasses with lime juice and a blend of roasted cumin and black salt. 2. Gently muddle fresh mint leaves with freshly squeezed lime juice and cane sugar syrup. 3. Fill glasses with ice cubes, pour over chilled sparkling water, and stir gently. 4. Garnish with lime wheels and a fresh mint sprig.',
    image: FALLBACK_RECIPE_IMAGES.nimbu_pani,
    dishModelKey: 'nimbu_pani',
  },
  {
    id: 30,
    name: 'Iced Matcha Oat Latte',
    category: 'Drinks',
    cuisine: 'Japanese',
    time: '8 min',
    kcal: 135,
    dietary: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Low-Calorie'],
    description: 'Ceremonial-grade emerald matcha whisked smooth with warm water and poured over chilled creamy oat milk and crystal ice.',
    ingredients: 'Ceremonial matcha powder, barista oat milk, pure maple syrup, warm water, crystal ice cubes',
    steps: '1. Sift ceremonial matcha powder into a ceramic bowl and whisk briskly in a zig-zag motion with warm water using a bamboo whisk until frothy. 2. Fill a tall glass with ice cubes and pour in chilled creamy oat milk sweetened lightly with maple syrup. 3. Slowly pour the vibrant green matcha shot over the oat milk for a layered swirl. 4. Stir before sipping.',
    image: FALLBACK_RECIPE_IMAGES.matcha_latte,
    dishModelKey: 'matcha_latte',
  },
];

export const RECIPE_CATEGORIES = [
  'All',
  'Indian',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Desserts',
  'Drinks',
  'Snacks',
] as const;

const RECIPES_STORAGE_KEY = 'rhRecipes_v5';
const FAVORITES_STORAGE_KEY = 'rhFavorites_v2';
const SESSION_STORAGE_KEY = 'rhSession_v1';
const USERS_STORAGE_KEY = 'rhUsers_v1';

function normalizeRecipe(r: Partial<Recipe> & { id: number; name: string }): Recipe {
  return {
    id: r.id,
    name: r.name,
    category: r.category || 'Dinner',
    cuisine: r.cuisine || 'Classic',
    time: r.time || '30 min',
    kcal: typeof r.kcal === 'number' && r.kcal > 0 ? r.kcal : 380,
    dietary: Array.isArray(r.dietary) && r.dietary.length > 0 ? r.dietary : ['Vegetarian'],
    description: r.description || '',
    ingredients: r.ingredients || '',
    steps: r.steps || '',
    image: r.image || FALLBACK_RECIPE_IMAGES.paneer_butter_masala,
    dishModelKey: r.dishModelKey,
  };
}

export function loadStoredRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(RECIPES_STORAGE_KEY);
    if (!raw) {
      // Preserve any custom user-created recipes from v4/v3/v2 while bringing in the 30-dish catalog with kcal & dietary
      const prevRaw =
        localStorage.getItem('rhRecipes_v4') ||
        localStorage.getItem('rhRecipes_v3') ||
        localStorage.getItem('rhRecipes_v2');
      if (prevRaw) {
        const prevParsed = JSON.parse(prevRaw) as Recipe[];
        if (Array.isArray(prevParsed)) {
          const starterIds = new Set(STARTER_RECIPES.map((s) => s.id));
          const customOnes = prevParsed
            .filter((r) => !starterIds.has(r.id))
            .map((r) => normalizeRecipe(r));
          return [...customOnes, ...STARTER_RECIPES];
        }
      }
      return STARTER_RECIPES;
    }
    const parsed = JSON.parse(raw) as Recipe[];
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed.map((r) => normalizeRecipe(r))
      : STARTER_RECIPES;
  } catch {
    return STARTER_RECIPES;
  }
}

export function saveStoredRecipes(recipes: Recipe[]): void {
  try {
    localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadStoredFavorites(): number[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY) || localStorage.getItem('rhFavorites');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === 'number') : [];
  } catch {
    return [];
  }
}

export function saveStoredFavorites(favorites: number[]): void {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadStoredSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserSession;
    return parsed?.name && (parsed.role === 'user' || parsed.role === 'admin') ? parsed : null;
  } catch {
    return null;
  }
}

export function saveStoredSession(session: UserSession | null): void {
  try {
    if (session) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function loadRegisteredUsers(): RegisteredUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRegisteredUsers(users: RegisteredUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // Ignore storage errors
  }
}
