import { STORAGE_KEYS } from './storageKeys.js'
import { recipeStorage } from './recipeStorage.js'

export const DEFAULT_SAVED_MAP = {
  'user-1': [1, 2, 5]
}

export const DEFAULT_COLLECTIONS = [
  {
    id: 'col-1',
    userId: 'user-1',
    name: 'Weeknight dinners',
    description: 'Simple favorites for busy evenings.',
    icon: '🍲',
    recipeIds: [1, 5],
    createdAt: '2026-10-16T10:00:00.000Z',
    updatedAt: '2026-10-16T10:00:00.000Z'
  },
  {
    id: 'col-2',
    userId: 'user-1',
    name: 'Lunch prep',
    description: 'Make-ahead meals for busy days.',
    icon: '🥗',
    recipeIds: [2],
    createdAt: '2026-10-19T14:30:00.000Z',
    updatedAt: '2026-10-19T14:30:00.000Z'
  },
  {
    id: 'col-3',
    userId: 'user-1',
    name: 'Recipes to try',
    description: 'Exciting new recipes bookmarked to cook this month.',
    icon: '✨',
    recipeIds: [1, 2, 5],
    createdAt: '2026-10-22T08:00:00.000Z',
    updatedAt: '2026-10-22T08:00:00.000Z'
  }
]

export const DEFAULT_CUSTOMIZATIONS = [
  {
    id: 'cust_user-1_5',
    userId: 'user-1',
    recipeId: 5,
    originalTitle: 'Lemon Chickpea Quinoa Bowl',
    customTitle: 'Lemon Chickpea Quinoa Bowl · My version',
    ingredientReplaced: '50 g feta cheese, crumbled',
    replacementIngredient: '50 g dairy-free feta',
    personalNotes: 'Substituted dairy feta with dairy-free feta to accommodate dairy preference.',
    collectionId: 'col-1',
    collectionName: 'Weeknight dinners',
    updatedAt: '2026-10-26T15:00:00.000Z'
  }
]

// --- Helper Functions ---

function getSavedMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_RECIPES)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SAVED_RECIPES, JSON.stringify(DEFAULT_SAVED_MAP))
      return DEFAULT_SAVED_MAP
    }
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : DEFAULT_SAVED_MAP
  } catch (err) {
    console.error('Failed to read saved recipes from localStorage:', err)
    return DEFAULT_SAVED_MAP
  }
}

function persistSavedMap(map) {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_RECIPES, JSON.stringify(map))
  } catch (err) {
    console.error('Failed to save bookmarks to localStorage:', err)
  }
}

function getCollectionsList() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COLLECTIONS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(DEFAULT_COLLECTIONS))
      return DEFAULT_COLLECTIONS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_COLLECTIONS
  } catch (err) {
    console.error('Failed to read collections from localStorage:', err)
    return DEFAULT_COLLECTIONS
  }
}

function persistCollectionsList(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(list))
  } catch (err) {
    console.error('Failed to persist collections to localStorage:', err)
  }
}

function getCustomizationsList() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMIZATIONS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMIZATIONS, JSON.stringify(DEFAULT_CUSTOMIZATIONS))
      return DEFAULT_CUSTOMIZATIONS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : DEFAULT_CUSTOMIZATIONS
  } catch (err) {
    console.error('Failed to read customizations from localStorage:', err)
    return DEFAULT_CUSTOMIZATIONS
  }
}

function persistCustomizationsList(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMIZATIONS, JSON.stringify(list))
  } catch (err) {
    console.error('Failed to persist customizations to localStorage:', err)
  }
}

// --- Cookbook Storage API ---

export const cookbookStorage = {
  // === Bookmarks / Saved Recipes ===

  getSavedRecipeIds(userId) {
    if (!userId) return []
    const map = getSavedMap()
    const ids = (map[String(userId)] || []).map((id) => Number(id)).filter((id) => !isNaN(id))
    // Clean up IDs that don't exist in recipes
    return ids.filter((id) => recipeStorage.getById(id) !== null)
  },

  isRecipeSaved(userId, recipeId) {
    if (!userId || recipeId === undefined || recipeId === null) return false
    const list = this.getSavedRecipeIds(userId)
    return list.includes(Number(recipeId))
  },

  saveRecipe(userId, recipeId) {
    if (!userId || recipeId === undefined || recipeId === null) return false
    const numId = Number(recipeId)
    if (isNaN(numId)) return false

    const map = getSavedMap()
    const uKey = String(userId)
    const list = new Set(map[uKey] || [])
    list.add(numId)
    map[uKey] = Array.from(list)
    persistSavedMap(map)
    return true
  },

  unsaveRecipe(userId, recipeId) {
    if (!userId || recipeId === undefined || recipeId === null) return false
    const numId = Number(recipeId)
    const map = getSavedMap()
    const uKey = String(userId)
    const list = (map[uKey] || []).filter((id) => Number(id) !== numId)
    map[uKey] = list
    persistSavedMap(map)

    // Also remove from any collection of this user
    const collections = getCollectionsList()
    let changedCol = false
    collections.forEach((col) => {
      if (String(col.userId) === uKey && col.recipeIds?.includes(numId)) {
        col.recipeIds = col.recipeIds.filter((id) => Number(id) !== numId)
        changedCol = true
      }
    })
    if (changedCol) {
      persistCollectionsList(collections)
    }

    return true
  },

  toggleSave(userId, recipeId) {
    const isSaved = this.isRecipeSaved(userId, recipeId)
    if (isSaved) {
      this.unsaveRecipe(userId, recipeId)
      return false
    } else {
      this.saveRecipe(userId, recipeId)
      return true
    }
  },

  // === Collections ===

  getUserCollections(userId) {
    if (!userId) return []
    const list = getCollectionsList()
    const userCols = list.filter((col) => String(col.userId) === String(userId))

    // Filter out invalid/orphaned recipe IDs so count and displayed list always match!
    return userCols.map((col) => ({
      ...col,
      recipeIds: (col.recipeIds || [])
        .map((id) => Number(id))
        .filter((id) => !isNaN(id) && recipeStorage.getById(id) !== null)
    }))
  },

  getCollectionById(userId, collectionId) {
    const list = this.getUserCollections(userId)
    return list.find((col) => String(col.id) === String(collectionId)) || null
  },

  createCollection(userId, { name, description = '', icon = '📁' }) {
    if (!userId) throw new Error('User ID is required to create a collection.')
    const trimmedName = name?.trim()
    if (!trimmedName) throw new Error('Collection name cannot be empty.')

    const list = getCollectionsList()
    const newCollection = {
      id: `col-${Date.now()}`,
      userId: String(userId),
      name: trimmedName,
      description: description.trim(),
      icon: icon || '📁',
      recipeIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    list.push(newCollection)
    persistCollectionsList(list)
    return newCollection
  },

  renameCollection(userId, collectionId, newName, newDescription, newIcon) {
    const list = getCollectionsList()
    const index = list.findIndex(
      (col) => String(col.id) === String(collectionId) && String(col.userId) === String(userId)
    )
    if (index === -1) {
      throw new Error('Collection not found or access denied.')
    }

    const trimmedName = newName?.trim()
    if (!trimmedName) {
      throw new Error('Collection name cannot be empty.')
    }

    list[index] = {
      ...list[index],
      name: trimmedName,
      description: newDescription !== undefined ? newDescription.trim() : list[index].description,
      icon: newIcon || list[index].icon,
      updatedAt: new Date().toISOString()
    }

    persistCollectionsList(list)
    return list[index]
  },

  deleteCollection(userId, collectionId) {
    const list = getCollectionsList()
    const filtered = list.filter(
      (col) => !(String(col.id) === String(collectionId) && String(col.userId) === String(userId))
    )
    persistCollectionsList(filtered)
    return true
  },

  addRecipeToCollection(userId, collectionId, recipeId) {
    const list = getCollectionsList()
    const col = list.find(
      (c) => String(c.id) === String(collectionId) && String(c.userId) === String(userId)
    )
    if (!col) throw new Error('Collection not found.')

    const numId = Number(recipeId)
    if (isNaN(numId)) throw new Error('Invalid recipe ID.')

    if (!Array.isArray(col.recipeIds)) {
      col.recipeIds = []
    }

    if (!col.recipeIds.includes(numId)) {
      col.recipeIds.push(numId)
      col.updatedAt = new Date().toISOString()
      persistCollectionsList(list)
    }

    // Ensure it's marked as saved as well
    this.saveRecipe(userId, recipeId)
    return col
  },

  removeRecipeFromCollection(userId, collectionId, recipeId) {
    const list = getCollectionsList()
    const col = list.find(
      (c) => String(c.id) === String(collectionId) && String(c.userId) === String(userId)
    )
    if (!col) throw new Error('Collection not found.')

    const numId = Number(recipeId)
    col.recipeIds = (col.recipeIds || []).filter((id) => Number(id) !== numId)
    col.updatedAt = new Date().toISOString()
    persistCollectionsList(list)
    return col
  },

  isRecipeInCollection(userId, collectionId, recipeId) {
    const col = this.getCollectionById(userId, collectionId)
    if (!col) return false
    return col.recipeIds.includes(Number(recipeId))
  },

  // === Customizations ===

  getUserCustomizations(userId) {
    if (!userId) return []
    const list = getCustomizationsList()
    return list.filter((cust) => String(cust.userId) === String(userId))
  },

  getCustomization(userId, recipeId) {
    if (!userId || recipeId === undefined) return null
    const list = this.getUserCustomizations(userId)
    return list.find((cust) => Number(cust.recipeId) === Number(recipeId)) || null
  },

  saveCustomization(userId, recipeId, customizationData) {
    if (!userId || recipeId === undefined) {
      throw new Error('User ID and Recipe ID are required.')
    }

    const list = getCustomizationsList()
    const existingIndex = list.findIndex(
      (c) => String(c.userId) === String(userId) && Number(c.recipeId) === Number(recipeId)
    )

    const updatedEntry = {
      id: `cust_${userId}_${recipeId}`,
      userId: String(userId),
      recipeId: Number(recipeId),
      originalTitle: customizationData.originalTitle || 'Recipe',
      customTitle: customizationData.customTitle?.trim() || customizationData.originalTitle,
      ingredientReplaced: customizationData.ingredientReplaced || '',
      replacementIngredient: customizationData.replacementIngredient || '',
      personalNotes: customizationData.personalNotes?.trim() || '',
      modifiedIngredients: Array.isArray(customizationData.modifiedIngredients)
        ? customizationData.modifiedIngredients
        : [],
      modifiedInstructions: Array.isArray(customizationData.modifiedInstructions)
        ? customizationData.modifiedInstructions
        : [],
      collectionId: customizationData.collectionId || null,
      collectionName: customizationData.collectionName || '',
      allergenNotes: customizationData.allergenNotes || '',
      customCookTime: customizationData.customCookTime ? Number(customizationData.customCookTime) : undefined,
      customServings: customizationData.customServings ? Number(customizationData.customServings) : undefined,
      personalRating: Number(customizationData.personalRating) || 5,
      updatedAt: new Date().toISOString()
    }

    if (existingIndex >= 0) {
      list[existingIndex] = updatedEntry
    } else {
      list.push(updatedEntry)
    }

    persistCustomizationsList(list)

    // Automatically ensure the base recipe is saved to cookbook
    this.saveRecipe(userId, recipeId)

    // Also add to the specified collection if selected
    if (customizationData.collectionId) {
      try {
        this.addRecipeToCollection(userId, customizationData.collectionId, recipeId)
      } catch (e) {
        console.warn('Could not add to collection:', e)
      }
    }

    return updatedEntry
  },

  deleteCustomization(userId, recipeId) {
    const list = getCustomizationsList()
    const filtered = list.filter(
      (c) => !(String(c.userId) === String(userId) && Number(c.recipeId) === Number(recipeId))
    )
    persistCustomizationsList(filtered)
    return true
  },

  resetDefaults() {
    persistSavedMap(DEFAULT_SAVED_MAP)
    persistCollectionsList(DEFAULT_COLLECTIONS)
    persistCustomizationsList(DEFAULT_CUSTOMIZATIONS)
  }
}
