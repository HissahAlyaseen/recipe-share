import { STORAGE_KEYS } from './storageKeys.js'
import { recipes as dataRecipes } from '../data/recipes.js'
import { bookmarkStorage } from './bookmarkStorage.js'
import { cookbookStorage } from './cookbookStorage.js'

export const RECIPES_UPDATED_EVENT = 'recipe-share:recipes-updated'

/**
 * Default recipes dataset sourced directly from src/data/recipes.js.
 * Matches Figma wireframes and includes expanded breakfast, lunch, and dinner recipes.
 */
export const DEFAULT_RECIPES = dataRecipes

function cloneRecipes(list) {
  return (list || []).map((r) => ({
    ...r,
    ingredients: Array.isArray(r.ingredients) ? [...r.ingredients] : [],
    ...(Array.isArray(r.ingredientItems)
      ? { ingredientItems: r.ingredientItems.map((item) => ({ ...item })) }
      : {}),
    instructions: Array.isArray(r.instructions) ? [...r.instructions] : [],
    dietaryTags: Array.isArray(r.dietaryTags) ? [...r.dietaryTags] : []
  }))
}

/**
 * Initialize storage with default recipes if not already present.
 */
function initRecipesStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECIPES)
    if (!raw) {
      const defaults = cloneRecipes(DEFAULT_RECIPES)
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(defaults))
      return defaults
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      const defaults = cloneRecipes(DEFAULT_RECIPES)
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(defaults))
      return defaults
    }
    return cloneRecipes(parsed)
  } catch (err) {
    console.error('Failed to read recipes from localStorage, falling back to defaults:', err)
    return cloneRecipes(DEFAULT_RECIPES)
  }
}

/**
 * Persist recipes array to localStorage and notify listeners.
 */
function saveRecipesToStorage(recipes) {
  try {
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes))
    if (
      typeof window !== 'undefined' &&
      typeof window.dispatchEvent === 'function' &&
      typeof CustomEvent !== 'undefined'
    ) {
      window.dispatchEvent(new CustomEvent(RECIPES_UPDATED_EVENT))
    }
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
      authorName: authorName || '',
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
    if (!authorId) {
      throw new Error('Unauthorized: User ID is required to delete a recipe.')
    }

    const recipes = initRecipesStorage()
    const index = recipes.findIndex((r) => String(r.id) === String(id))
    if (index === -1) {
      throw new Error(`Recipe with id "${id}" not found.`)
    }

    const existing = recipes[index]
    if (String(existing.authorId) !== String(authorId)) {
      throw new Error('Unauthorized: You can only delete your own recipes.')
    }

    const deletedId = existing.id
    const filtered = recipes.filter((r) => String(r.id) !== String(deletedId))
    saveRecipesToStorage(filtered)

    // Cascade cleanup: clean up all related bookmarks, collection references, and customizations
    bookmarkStorage.removeAllForRecipe(deletedId)
    cookbookStorage.removeRecipeReferences(deletedId)

    return true
  },

  resetDefaults() {
    const defaults = cloneRecipes(DEFAULT_RECIPES)
    saveRecipesToStorage(defaults)
    return defaults
  }
}
