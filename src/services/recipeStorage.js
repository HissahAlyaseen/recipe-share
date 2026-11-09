import { STORAGE_KEYS } from './storageKeys.js'

/**
 * Enhanced seed data combining the original starter recipes
 * with author metadata, instructions, and additional mock recipes.
 */
const DEFAULT_RECIPES = [
  {
    id: 1,
    title: 'Vegetable Pasta',
    description: 'A vibrant and healthy Mediterranean pasta tossed with cherry tomatoes, basil, and extra virgin olive oil.',
    category: 'Dinner',
    ingredients: ['250g Whole Wheat Pasta', '200g Cherry Tomatoes', '3 tbsp Extra Virgin Olive Oil', '2 cloves Garlic, minced', 'Fresh Basil leaves', 'Salt and Black Pepper to taste'],
    instructions: [
      'Boil pasta in salted water until al dente according to package instructions.',
      'Heat olive oil in a skillet over medium heat. Sauté minced garlic until fragrant.',
      'Add halved cherry tomatoes and cook until soft and juicy.',
      'Drain the pasta and toss with the tomato mixture.',
      'Garnish with fresh basil leaves, cracked black pepper, and serve warm.'
    ],
    dietaryTags: ['Vegetarian'],
    cookingTime: 25,
    prepTime: 10,
    servings: 4,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=80',
    authorId: 'user-2',
    authorName: 'Chef Omar',
    createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-15T10:00:00.000Z'
  },
  {
    id: 2,
    title: 'Chicken Salad',
    description: 'Crisp romaine lettuce topped with seasoned grilled chicken breast, fresh cucumbers, and a zesty lemon vinaigrette.',
    category: 'Lunch',
    ingredients: ['2 Grilled Chicken Breasts, sliced', '1 head Romaine Lettuce, chopped', '1 English Cucumber, sliced', '2 tbsp Lemon Juice', '3 tbsp Olive Oil', '1 tsp Dijon Mustard'],
    instructions: [
      'Season chicken breast with salt, pepper, and garlic powder, then grill for 6-7 minutes per side.',
      'Wash and chop romaine lettuce and slice cucumbers.',
      'Whisk lemon juice, olive oil, and Dijon mustard in a small bowl to make dressing.',
      'Combine lettuce, cucumber, and sliced warm chicken in a large bowl.',
      'Drizzle with lemon dressing and toss gently before serving.'
    ],
    dietaryTags: ['Gluten-Free', 'High-Protein'],
    cookingTime: 20,
    prepTime: 10,
    servings: 2,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    authorId: 'user-3',
    authorName: 'Sarah Jenkins',
    createdAt: '2026-10-18T12:00:00.000Z',
    updatedAt: '2026-10-18T12:00:00.000Z'
  },
  {
    id: 3,
    title: 'Fruit Smoothie',
    description: 'Creamy and refreshing energizing fruit smoothie packed with ripe bananas, fresh strawberries, and almond milk.',
    category: 'Breakfast',
    ingredients: ['1 ripe Banana', '1 cup Fresh Strawberries', '1 cup Unsweetened Almond Milk', '1 tbsp Honey or Maple Syrup', '1/2 cup Greek Yogurt'],
    instructions: [
      'Peel the banana and wash strawberries.',
      'Add all ingredients into a high-speed blender.',
      'Blend on high speed for 60-90 seconds until completely smooth and creamy.',
      'Pour into a chilled glass and enjoy immediately.'
    ],
    dietaryTags: ['Vegetarian', 'Gluten-Free'],
    cookingTime: 5,
    prepTime: 5,
    servings: 1,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&auto=format&fit=crop&q=80',
    authorId: 'user-2',
    authorName: 'Chef Omar',
    createdAt: '2026-10-20T08:30:00.000Z',
    updatedAt: '2026-10-20T08:30:00.000Z'
  },
  {
    id: 4,
    title: 'Shakshuka with Feta & Herbs',
    description: 'Gently poached eggs in a savory, spiced bell pepper and tomato sauce, topped with crumbled feta cheese and fresh cilantro.',
    category: 'Breakfast',
    ingredients: ['4 large Eggs', '1 can (400g) Diced Tomatoes', '1 Red Bell Pepper, diced', '1 Yellow Onion, chopped', '2 cloves Garlic, minced', '1 tsp Ground Cumin', '1 tsp Smoked Paprika', '50g Crumbled Feta Cheese', 'Fresh Cilantro for garnish'],
    instructions: [
      'Heat 2 tablespoons of olive oil in a deep skillet over medium heat.',
      'Add diced onion and bell pepper; sauté for 5 minutes until tender.',
      'Stir in minced garlic, ground cumin, and smoked paprika. Cook for 1 minute until fragrant.',
      'Pour in diced tomatoes, season with salt and pepper, and simmer for 10 minutes until sauce thickens.',
      'Create 4 small wells in the sauce with a spoon and crack an egg into each well.',
      'Cover the pan and cook on low heat for 5-8 minutes until egg whites are set and yolks remain runny.',
      'Remove from heat, sprinkle with crumbled feta and cilantro, and serve with warm bread.'
    ],
    dietaryTags: ['Vegetarian', 'Gluten-Free'],
    cookingTime: 25,
    prepTime: 10,
    servings: 2,
    difficulty: 'Medium',
    image: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=800&auto=format&fit=crop&q=80',
    authorId: 'user-1',
    authorName: 'Alex',
    createdAt: '2026-10-25T09:15:00.000Z',
    updatedAt: '2026-10-25T09:15:00.000Z'
  },
  {
    id: 5,
    title: 'Warm Berry Cinnamon Oatmeal Bowl',
    description: 'Hearty rolled oats simmered in oat milk with aromatic cinnamon, topped with fresh blueberries, sliced bananas, and crushed walnuts.',
    category: 'Breakfast',
    ingredients: ['1 cup Rolled Oats', '2 cups Oat Milk', '1/2 tsp Ground Cinnamon', '1/2 cup Fresh Blueberries', '1/2 Banana, sliced', '2 tbsp Chopped Walnuts', '1 tbsp Pure Maple Syrup'],
    instructions: [
      'Combine rolled oats, oat milk, and ground cinnamon in a small saucepan over medium heat.',
      'Bring to a gentle boil, then reduce heat to low and simmer for 5-7 minutes, stirring occasionally until thick.',
      'Transfer oatmeal to a serving bowl.',
      'Top with fresh blueberries, sliced banana, and crushed walnuts.',
      'Drizzle with pure maple syrup and serve warm.'
    ],
    dietaryTags: ['Vegetarian', 'Vegan', 'Dairy-Free'],
    cookingTime: 10,
    prepTime: 5,
    servings: 1,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&auto=format&fit=crop&q=80',
    authorId: 'user-1',
    authorName: 'Alex',
    createdAt: '2026-10-28T07:45:00.000Z',
    updatedAt: '2026-10-28T07:45:00.000Z'
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
  /**
   * Get all recipes in the system.
   */
  getAll() {
    return initRecipesStorage()
  },

  /**
   * Get a recipe by its ID.
   */
  getById(id) {
    const recipes = initRecipesStorage()
    const numericId = Number(id)
    return recipes.find((r) => r.id === numericId || String(r.id) === String(id)) || null
  },

  /**
   * Get all recipes authored by a specific user.
   */
  getByAuthor(authorId) {
    if (!authorId) return []
    const recipes = initRecipesStorage()
    return recipes.filter((r) => String(r.authorId) === String(authorId))
  },

  /**
   * Create a new recipe authored by the user.
   */
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

  /**
   * Update an existing recipe.
   */
  update(id, authorId, updates) {
    const recipes = initRecipesStorage()
    const index = recipes.findIndex((r) => String(r.id) === String(id))
    if (index === -1) {
      throw new Error(`Recipe with id "${id}" not found.`)
    }

    const existing = recipes[index]
    // Verify ownership in dev/production
    if (authorId && String(existing.authorId) !== String(authorId)) {
      throw new Error('Unauthorized: You can only edit your own recipes.')
    }

    const updatedRecipe = {
      ...existing,
      ...updates,
      id: existing.id, // prevent ID overwrite
      authorId: existing.authorId,
      authorName: existing.authorName,
      createdAt: existing.createdAt,
      cookingTime: updates.cookingTime !== undefined ? Math.max(1, Number(updates.cookingTime)) : existing.cookingTime,
      prepTime: updates.prepTime !== undefined ? Math.max(0, Number(updates.prepTime)) : existing.prepTime,
      servings: updates.servings !== undefined ? Math.max(1, Number(updates.servings)) : existing.servings,
      updatedAt: new Date().toISOString()
    }

    recipes[index] = updatedRecipe
    saveRecipesToStorage(recipes)
    return updatedRecipe
  },

  /**
   * Delete a recipe authored by the user.
   */
  delete(id, authorId) {
    const recipes = initRecipesStorage()
    const existing = recipes.find((r) => String(r.id) === String(id))
    if (!existing) {
      throw new Error(`Recipe with id "${id}" not found.`)
    }

    if (authorId && String(existing.authorId) !== String(authorId)) {
      throw new Error('Unauthorized: You can only delete your own recipes.')
    }

    const filtered = recipes.filter((r) => String(r.id) !== String(id))
    saveRecipesToStorage(filtered)
    return true
  },

  /**
   * Reset recipes to seed defaults (useful for testing and reset demo).
   */
  resetToDefaults() {
    saveRecipesToStorage(DEFAULT_RECIPES)
    return DEFAULT_RECIPES
  }
}
