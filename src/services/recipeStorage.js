import { STORAGE_KEYS } from './storageKeys.js'

/**
 * Seed data matching the Figma wireframes (Alex's recipes, Maya Chen's saved recipes, etc.)
 */
export const DEFAULT_RECIPES = [
  {
    id: 1,
    title: 'Spinach & White Bean Skillet',
    description: 'A comforting weeknight skillet with tender white beans, wilted baby spinach, garlic, and a squeeze of fresh lemon.',
    category: 'Dinner',
    cuisine: 'Mediterranean',
    ingredients: [
      '1 can (400g) Cannellini Beans, rinsed',
      '150g Fresh Baby Spinach',
      '2 tbsp Extra Virgin Olive Oil',
      '3 cloves Garlic, sliced',
      '1/2 Lemon, juiced',
      'Sea salt and cracked black pepper'
    ],
    instructions: [
      'Heat olive oil in a wide skillet over medium heat. Sauté sliced garlic for 1 minute until fragrant.',
      'Add rinsed cannellini beans and a pinch of salt. Cook gently for 3-4 minutes.',
      'Add fresh baby spinach in handfuls, tossing until wilted.',
      'Finish with fresh lemon juice, black pepper, and serve warm with crusty bread.'
    ],
    dietaryTags: ['Vegetarian', 'Gluten-free'],
    cookingTime: 20,
    prepTime: 5,
    servings: 2,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    status: 'Published',
    authorId: 'user-1',
    authorName: 'Alex',
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z'
  },
  {
    id: 2,
    title: 'Crispy Potato & Herb Salad',
    description: 'Golden roasted baby potatoes tossed with fresh dill, parsley, capers, and a whole-grain mustard vinaigrette.',
    category: 'Lunch',
    cuisine: 'Modern',
    ingredients: [
      '500g Baby Potatoes, halved',
      '2 tbsp Olive Oil',
      '1/4 cup Fresh Dill and Parsley, chopped',
      '1 tbsp Capers, drained',
      '1 tbsp Whole Grain Dijon Mustard',
      '1 tbsp Apple Cider Vinegar'
    ],
    instructions: [
      'Preheat oven to 200°C. Toss halved baby potatoes with olive oil, salt, and pepper.',
      'Roast for 25-30 minutes until golden and crispy at the edges.',
      'Whisk mustard, vinegar, and 1 tbsp olive oil in a salad bowl.',
      'Toss warm potatoes with dressing, fresh herbs, and capers.'
    ],
    dietaryTags: ['Vegetarian', 'Gluten-free'],
    cookingTime: 35,
    prepTime: 10,
    servings: 2,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    status: 'Published',
    authorId: 'user-1',
    authorName: 'Alex',
    createdAt: '2026-11-02T12:00:00.000Z',
    updatedAt: '2026-11-02T12:00:00.000Z'
  },
  {
    id: 3,
    title: 'Apple Cinnamon Oats',
    description: 'Warm, slow-simmered rolled oats with diced crisp apples, ground Ceylon cinnamon, and a drizzle of pure maple syrup.',
    category: 'Breakfast',
    cuisine: 'Healthy',
    ingredients: [
      '1 cup Rolled Oats',
      '2 cups Almond Milk',
      '1 Honeycrisp Apple, diced',
      '1/2 tsp Ground Cinnamon',
      '1 tbsp Maple Syrup',
      '2 tbsp Toasted Pecans'
    ],
    instructions: [
      'Combine oats, almond milk, and cinnamon in a small saucepan over medium heat.',
      'Simmer for 5 minutes, stirring occasionally until creamy.',
      'Stir in half of the diced apples.',
      'Top with remaining apples, pecans, and maple syrup.'
    ],
    dietaryTags: ['Vegetarian', 'Vegan', 'Dairy-Free'],
    cookingTime: 15,
    prepTime: 5,
    servings: 1,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&auto=format&fit=crop&q=80',
    status: 'Draft',
    authorId: 'user-1',
    authorName: 'Alex',
    createdAt: '2026-11-10T08:00:00.000Z',
    updatedAt: '2026-11-10T08:00:00.000Z'
  },
  {
    id: 4,
    title: 'Vegetable Pasta',
    description: 'A vibrant Mediterranean pasta tossed with sweet cherry tomatoes, fresh basil, and extra virgin olive oil.',
    category: 'Dinner',
    cuisine: 'Italian',
    ingredients: [
      '250g Whole Wheat Penne',
      '200g Cherry Tomatoes, halved',
      '3 tbsp Extra Virgin Olive Oil',
      '2 cloves Garlic, minced',
      'Fresh Basil leaves',
      'Salt and cracked black pepper'
    ],
    instructions: [
      'Boil pasta in salted water until al dente.',
      'Heat olive oil in a skillet, sauté garlic for 1 minute.',
      'Add cherry tomatoes and cook until juicy and blistering.',
      'Toss drained pasta with tomatoes and fresh basil.'
    ],
    dietaryTags: ['Vegetarian'],
    cookingTime: 25,
    prepTime: 10,
    servings: 4,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=80',
    status: 'Published',
    authorId: 'user-2',
    authorName: 'Chef Omar',
    createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-15T10:00:00.000Z'
  },
  {
    id: 5,
    title: 'Chicken Salad',
    description: 'Crisp romaine lettuce topped with seasoned grilled chicken breast, fresh cucumbers, and zesty lemon dressing.',
    category: 'Lunch',
    cuisine: 'American',
    ingredients: [
      '2 Grilled Chicken Breasts, sliced',
      '1 head Romaine Lettuce, chopped',
      '1 English Cucumber, sliced',
      '2 tbsp Lemon Juice',
      '3 tbsp Olive Oil'
    ],
    instructions: [
      'Grill chicken breast for 6-7 minutes per side until done.',
      'Chop romaine lettuce and slice cucumber.',
      'Whisk lemon juice and olive oil with salt and pepper.',
      'Toss all ingredients together in a large salad bowl.'
    ],
    dietaryTags: ['Gluten-Free', 'High-Protein'],
    cookingTime: 20,
    prepTime: 10,
    servings: 2,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    status: 'Published',
    authorId: 'user-3',
    authorName: 'Sarah Jenkins',
    createdAt: '2026-10-18T12:00:00.000Z',
    updatedAt: '2026-10-18T12:00:00.000Z'
  },
  {
    id: 6,
    title: 'Lemon Chickpea Quinoa Bowl',
    description: 'Protein-packed Mediterranean bowl with fluffy quinoa, tender chickpeas, diced cucumber, cherry tomatoes, and zesty lemon dressing.',
    category: 'Dinner',
    cuisine: 'Mediterranean',
    ingredients: [
      '1 cup cooked quinoa',
      '1 can (400 g) chickpeas, drained',
      '1/2 cucumber and 1 cup cherry tomatoes, chopped',
      '50 g feta cheese, crumbled',
      '1 lemon, juiced, and 1 tbsp olive oil'
    ],
    instructions: [
      'Cook quinoa according to package instructions, then allow to cool.',
      'Toss quinoa, chickpeas, cucumber, and cherry tomatoes in a large bowl.',
      'Mix lemon juice with olive oil and drizzle over bowl.',
      'Toss through gently, top with feta cheese, and serve.'
    ],
    dietaryTags: ['Vegetarian', 'Gluten-free'],
    cookingTime: 25,
    prepTime: 10,
    servings: 2,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    status: 'Published',
    authorId: 'user-4',
    authorName: 'Maya Chen',
    createdAt: '2026-10-29T14:00:00.000Z',
    updatedAt: '2026-10-29T14:00:00.000Z'
  },
  {
    id: 7,
    title: 'Roasted Vegetable Tacos',
    description: 'Charred corn, roasted zucchini, and spiced black beans served in warm corn tortillas with avocado crema.',
    category: 'Dinner',
    cuisine: 'Mexican',
    ingredients: [
      '6 small Corn Tortillas',
      '1 Zucchini, diced',
      '1 cup Sweet Corn kernels',
      '1 can Black Beans, rinsed',
      '1 Avocado, mashed with lime'
    ],
    instructions: [
      'Roast zucchini and corn on a baking sheet at 200°C for 20 minutes.',
      'Warm corn tortillas in a dry skillet.',
      'Fill tortillas with roasted vegetables and seasoned black beans.',
      'Dollop with mashed avocado and serve with lime wedges.'
    ],
    dietaryTags: ['Vegetarian', 'Gluten-free'],
    cookingTime: 30,
    prepTime: 10,
    servings: 2,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80',
    status: 'Published',
    authorId: 'user-5',
    authorName: 'Mateo Silva',
    createdAt: '2026-10-30T18:00:00.000Z',
    updatedAt: '2026-10-30T18:00:00.000Z'
  },
  {
    id: 8,
    title: 'Black Bean & Rice Bowl',
    description: 'Seasoned black beans served over cilantro lime rice with charred peppers and fresh pico de gallo.',
    category: 'Lunch',
    cuisine: 'Mexican',
    ingredients: [
      '1 cup Cooked Brown Rice',
      '1 can Black Beans, rinsed',
      '1 Lime, juiced',
      'Fresh Cilantro, chopped',
      '1/2 cup Pico de Gallo'
    ],
    instructions: [
      'Toss warm brown rice with fresh lime juice and chopped cilantro.',
      'Warm seasoned black beans in a small saucepan.',
      'Assemble bowl with rice, beans, and top with fresh pico de gallo.'
    ],
    dietaryTags: ['Vegetarian', 'Gluten-free'],
    cookingTime: 20,
    prepTime: 5,
    servings: 2,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&auto=format&fit=crop&q=80',
    status: 'Published',
    authorId: 'user-4',
    authorName: 'Maya Chen',
    createdAt: '2026-11-01T12:00:00.000Z',
    updatedAt: '2026-11-01T12:00:00.000Z'
  },
  {
    id: 9,
    title: 'Tomato & Red Lentil Soup',
    description: 'Hearty and warming red lentil soup gently simmered with crushed tomatoes, ginger, and turmeric.',
    category: 'Dinner',
    cuisine: 'Mediterranean',
    ingredients: [
      '1 cup Red Lentils, rinsed',
      '1 can (400g) Crushed Tomatoes',
      '4 cups Vegetable Broth',
      '1 Onion, chopped',
      '1 tsp Ground Turmeric'
    ],
    instructions: [
      'Sauté chopped onion in a large pot until soft.',
      'Add turmeric, red lentils, crushed tomatoes, and vegetable broth.',
      'Simmer for 25 minutes until lentils are tender and soup is rich.',
      'Garnish with fresh parsley and serve hot.'
    ],
    dietaryTags: ['Vegan', 'Gluten-free'],
    cookingTime: 35,
    prepTime: 10,
    servings: 4,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80',
    status: 'Published',
    authorId: 'user-1',
    authorName: 'Alex',
    createdAt: '2026-11-02T19:00:00.000Z',
    updatedAt: '2026-11-02T19:00:00.000Z'
  }
]

/**
 * Initialize storage with default recipes if not already present.
 */
function initRecipesStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECIPES)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(DEFAULT_RECIPES))
      return DEFAULT_RECIPES
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(DEFAULT_RECIPES))
      return DEFAULT_RECIPES
    }
    return parsed
  } catch (err) {
    console.error('Failed to read recipes from localStorage, falling back to defaults:', err)
    return DEFAULT_RECIPES
  }
}

/**
 * Persist recipes array to localStorage.
 */
function saveRecipesToStorage(recipes) {
  try {
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes))
    return true
  } catch (err) {
    console.error('Failed to save recipes to localStorage:', err)
    return false
  }
}

export const recipeStorage = {
  getAll() {
    return initRecipesStorage()
  },

  getById(id) {
    if (id === undefined || id === null) return null
    const recipes = initRecipesStorage()
    const numericId = Number(id)
    return recipes.find((r) => r.id === numericId || String(r.id) === String(id)) || null
  },

  getByAuthor(authorId) {
    if (!authorId) return []
    const recipes = initRecipesStorage()
    return recipes.filter((r) => String(r.authorId) === String(authorId))
  },

  create(authorId, authorName, recipeData) {
    const recipes = initRecipesStorage()
    const newId = recipes.length > 0 ? Math.max(...recipes.map((r) => Number(r.id) || 0)) + 1 : 1

    const newRecipe = {
      id: newId,
      title: recipeData.title?.trim() || 'Untitled Recipe',
      description: recipeData.description?.trim() || '',
      category: recipeData.category || 'Dinner',
      cuisine: recipeData.cuisine?.trim() || '',
      ingredients: Array.isArray(recipeData.ingredients) ? recipeData.ingredients : [],
      ingredientItems: Array.isArray(recipeData.ingredientItems) ? recipeData.ingredientItems : [],
      instructions: Array.isArray(recipeData.instructions) ? recipeData.instructions : [],
      dietaryTags: Array.isArray(recipeData.dietaryTags) ? recipeData.dietaryTags : [],
      cookingTime: Math.max(1, Number(recipeData.cookingTime) || 15),
      prepTime: Math.max(0, Number(recipeData.prepTime) || 5),
      servings: Math.max(1, Number(recipeData.servings) || 2),
      difficulty: recipeData.difficulty || 'Easy',
      image: recipeData.image?.trim() || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&auto=format&fit=crop&q=80',
      status: recipeData.status || 'Published',
      authorId: String(authorId),
      authorName: authorName || 'Alex',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedList = [newRecipe, ...recipes]
    saveRecipesToStorage(updatedList)
    return newRecipe
  },

  update(id, authorId, updates) {
    const recipes = initRecipesStorage()
    const index = recipes.findIndex((r) => String(r.id) === String(id))
    if (index === -1) {
      throw new Error(`Recipe with id "${id}" not found.`)
    }

    const existing = recipes[index]
    if (authorId && String(existing.authorId) !== String(authorId)) {
      throw new Error('Unauthorized: You can only edit your own recipes.')
    }

    const updated = {
      ...existing,
      ...updates,
      id: existing.id,
      authorId: existing.authorId,
      authorName: existing.authorName,
      updatedAt: new Date().toISOString()
    }

    recipes[index] = updated
    saveRecipesToStorage(recipes)
    return updated
  },

  delete(id, authorId) {
    const recipes = initRecipesStorage()
    const index = recipes.findIndex((r) => String(r.id) === String(id))
    if (index === -1) {
      throw new Error(`Recipe with id "${id}" not found.`)
    }

    const existing = recipes[index]
    if (authorId && String(existing.authorId) !== String(authorId)) {
      throw new Error('Unauthorized: You can only delete your own recipes.')
    }

    const filtered = recipes.filter((r) => String(r.id) !== String(id))
    saveRecipesToStorage(filtered)
    return true
  },

  resetDefaults() {
    saveRecipesToStorage(DEFAULT_RECIPES)
    return DEFAULT_RECIPES
  }
}
