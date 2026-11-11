import { STORAGE_KEYS } from './storageKeys.js'
import { recipeStorage } from './recipeStorage.js'
import { bookmarkStorage } from './bookmarkStorage.js'

export const DEFAULT_SAVED_MAP = {
  'user-1': [1, 2, 4, 5]
}

export const DEFAULT_COLLECTIONS = [
  {
    id: 'col-1',
    userId: 'user-1',
    name: 'Weeknight dinners',
    description: 'Simple favorites for busy evenings.',
    icon: '🍲',
    recipeIds: [1, 4, 5],
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
    recipeIds: [1, 2],
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
    customServings: 2,
    ingredientReplaced: 'Feta Cheese',
    replacementIngredient: '50 g dairy-free feta',
    substitutions: [
      { original: 'Feta Cheese', replacement: '50 g dairy-free feta' }
    ],
    modifiedIngredients: [
      '1 cup Quinoa',
      '1 can Chickpeas, rinsed',
      '1 Cucumber, diced',
      '1 cup Cherry Tomatoes, halved',
      '50 g dairy-free feta'
    ],
    modifiedInstructions: [
      'Cook quinoa according to package instructions and let cool.',
      'Toss quinoa, chickpeas, cucumber, and cherry tomatoes in a large bowl.',
      'Whisk extra lemon juice with olive oil and drizzle over the bowl.',
      'Top with crumbled dairy-free feta cheese and serve chilled.'
    ],
    personalNotes: 'Substituted dairy feta with dairy-free feta to accommodate dairy preference.',
    personalTags: ['Dairy-free', 'Meal prep'],
    collectionId: 'col-1',
    collectionName: 'Weeknight dinners',
    updatedAt: '2026-10-26T15:00:00.000Z'
  }
]

// --- Helper Functions ---

export const COOKBOOK_UPDATED_EVENT = 'recipe-share:cookbook-updated'

function dispatchCookbookUpdated() {
  if (
    typeof window !== 'undefined' &&
    typeof window.dispatchEvent === 'function' &&
    typeof CustomEvent !== 'undefined'
  ) {
    window.dispatchEvent(new CustomEvent(COOKBOOK_UPDATED_EVENT))
  }
}

function cloneSavedMap(map) {
  const copy = {}
  Object.keys(map || {}).forEach((k) => {
    copy[k] = Array.isArray(map[k]) ? [...map[k]] : []
  })
  return copy
}

function cloneCollections(list) {
  return (list || []).map((col) => ({
    ...col,
    recipeIds: Array.isArray(col.recipeIds) ? [...col.recipeIds] : []
  }))
}

function cloneCustomizations(list) {
  return (list || []).map((cust) => ({
    ...cust,
    substitutions: Array.isArray(cust.substitutions)
      ? cust.substitutions.map((s) => ({ ...s }))
      : [],
    modifiedIngredients: Array.isArray(cust.modifiedIngredients) ? [...cust.modifiedIngredients] : [],
    modifiedInstructions: Array.isArray(cust.modifiedInstructions) ? [...cust.modifiedInstructions] : [],
    personalTags: Array.isArray(cust.personalTags) ? [...cust.personalTags] : []
  }))
}

function isSameRecipeId(a, b) {
  if (a === undefined || a === null || b === undefined || b === null) return false
  const strA = String(a).trim()
  const strB = String(b).trim()
  if (!strA || !strB) return false
  const numA = Number(strA)
  const numB = Number(strB)
  if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
    return numA === numB
  }
  return strA === strB
}

function validateCollectionName(list, userId, rawName, excludeCollectionId = null) {
  if (!userId) {
    throw new Error('User ID is required.')
  }
  const trimmedName = typeof rawName === 'string' ? rawName.trim() : ''
  if (!trimmedName) {
    throw new Error('Cookbook name cannot be empty.')
  }
  if (trimmedName.length > 40) {
    throw new Error('Cookbook name must be between 1 and 40 characters.')
  }

  const normalizedTarget = trimmedName.toLowerCase()
  const duplicateExists = list.some(
    (col) =>
      String(col.userId) === String(userId) &&
      (excludeCollectionId === null || String(col.id) !== String(excludeCollectionId)) &&
      String(col.name ?? '').trim().toLowerCase() === normalizedTarget
  )

  if (duplicateExists) {
    throw new Error(
      'A cookbook collection with this name already exists. Please choose a unique name.'
    )
  }

  return trimmedName
}

function getSavedMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_RECIPES)
    if (!raw) {
      const defaults = cloneSavedMap(DEFAULT_SAVED_MAP)
      localStorage.setItem(STORAGE_KEYS.SAVED_RECIPES, JSON.stringify(defaults))
      return defaults
    }
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? cloneSavedMap(parsed)
      : cloneSavedMap(DEFAULT_SAVED_MAP)
  } catch (err) {
    console.error('Failed to read saved recipes from localStorage:', err)
    return cloneSavedMap(DEFAULT_SAVED_MAP)
  }
}

function persistSavedMap(map) {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_RECIPES, JSON.stringify(map))
    dispatchCookbookUpdated()
  } catch (err) {
    console.error('Failed to save bookmarks to localStorage:', err)
  }
}

function getCollectionsList() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COLLECTIONS)
    if (!raw) {
      const defaults = cloneCollections(DEFAULT_COLLECTIONS)
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(defaults))
      return defaults
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? cloneCollections(parsed) : cloneCollections(DEFAULT_COLLECTIONS)
  } catch (err) {
    console.error('Failed to read collections from localStorage:', err)
    return cloneCollections(DEFAULT_COLLECTIONS)
  }
}

function persistCollectionsList(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(list))
    dispatchCookbookUpdated()
  } catch (err) {
    console.error('Failed to persist collections to localStorage:', err)
  }
}

function getCustomizationsList() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMIZATIONS)
    if (!raw) {
      const defaults = cloneCustomizations(DEFAULT_CUSTOMIZATIONS)
      localStorage.setItem(STORAGE_KEYS.CUSTOMIZATIONS, JSON.stringify(defaults))
      return defaults
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? cloneCustomizations(parsed) : cloneCustomizations(DEFAULT_CUSTOMIZATIONS)
  } catch (err) {
    console.error('Failed to read customizations from localStorage:', err)
    return cloneCustomizations(DEFAULT_CUSTOMIZATIONS)
  }
}

function persistCustomizationsList(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMIZATIONS, JSON.stringify(list))
    dispatchCookbookUpdated()
  } catch (err) {
    console.error('Failed to persist customizations to localStorage:', err)
  }
}

function syncBookmarkCollections(userId, recipeId, collectionsList) {
  if (!bookmarkStorage.isBookmarked(userId, recipeId)) return
  const colIds = collectionsList
    .filter((c) => String(c.userId) === String(userId) && c.recipeIds?.includes(Number(recipeId)))
    .map((c) => c.id)
  bookmarkStorage.updateBookmarkCollections(userId, recipeId, colIds)
}

// --- Cookbook Storage API ---

export const cookbookStorage = {
  // === Bookmarks / Saved Recipes ===

  getSavedRecipeIds(userId) {
    if (!userId) return []
    return bookmarkStorage.getUserBookmarkedRecipeIds(userId)
  },

  isRecipeSaved(userId, recipeId) {
    if (!userId || recipeId === undefined || recipeId === null) return false
    return bookmarkStorage.isBookmarked(userId, recipeId)
  },

  saveRecipe(userId, recipeId) {
    if (!userId || recipeId === undefined || recipeId === null) return false
    const numId = Number(recipeId)
    if (isNaN(numId)) return false

    // Synchronize bookmark data model
    bookmarkStorage.addBookmark(userId, numId)

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

    // Synchronize bookmark removal
    bookmarkStorage.removeBookmark(userId, numId)

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

    const list = getCollectionsList()
    const trimmedName = validateCollectionName(list, userId, name)
    const now = new Date().toISOString()

    const newCollection = {
      id: `col-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: String(userId),
      name: trimmedName,
      description: typeof description === 'string' ? description.trim() : '',
      icon: icon || '📁',
      recipeIds: [],
      createdAt: now,
      updatedAt: now
    }

    list.push(newCollection)
    persistCollectionsList(list)
    return newCollection
  },

  renameCollection(userId, collectionId, newName, newDescription, newIcon) {
    if (!userId) throw new Error('User ID is required to rename a collection.')

    const list = getCollectionsList()
    const index = list.findIndex(
      (col) => String(col.id) === String(collectionId) && String(col.userId) === String(userId)
    )
    if (index === -1) {
      throw new Error('Collection not found or access denied.')
    }

    const trimmedName = validateCollectionName(list, userId, newName, collectionId)

    list[index] = {
      ...list[index],
      name: trimmedName,
      description:
        newDescription !== undefined ? String(newDescription ?? '').trim() : list[index].description,
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

    // Detach deleted collectionId from user's bookmarks without deleting the bookmarks
    bookmarkStorage.getUserBookmarks(userId).forEach((bm) => {
      if (bm.collectionIds?.includes(collectionId)) {
        bookmarkStorage.updateBookmarkCollections(
          userId,
          bm.recipeId,
          bm.collectionIds.filter((id) => id !== collectionId)
        )
      }
    })
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

    // Ensure it's marked as saved and keep bookmark.collectionIds in sync
    this.saveRecipe(userId, recipeId)
    syncBookmarkCollections(userId, numId, list)
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
    syncBookmarkCollections(userId, numId, list)
    return col
  },

  setRecipeCollections(userId, recipeId, targetCollectionIds = []) {
    if (!userId) throw new Error('User ID is required.')
    const numId = Number(recipeId)
    if (isNaN(numId)) throw new Error('Invalid recipe ID.')

    const targetSet = new Set(
      (Array.isArray(targetCollectionIds) ? targetCollectionIds : [targetCollectionIds])
        .filter(Boolean)
        .map(String)
    )

    const list = getCollectionsList()
    const now = new Date().toISOString()
    let modified = false

    list.forEach((col) => {
      if (String(col.userId) !== String(userId)) return
      const currentIds = Array.isArray(col.recipeIds) ? col.recipeIds.map(Number) : []
      const hasRecipe = currentIds.includes(numId)
      const shouldHave = targetSet.has(String(col.id))

      if (shouldHave && !hasRecipe) {
        col.recipeIds = [...currentIds, numId]
        col.updatedAt = now
        modified = true
      } else if (!shouldHave && hasRecipe) {
        col.recipeIds = currentIds.filter((id) => id !== numId)
        col.updatedAt = now
        modified = true
      }
    })

    if (modified) {
      persistCollectionsList(list)
    }

    // Ensure the recipe stays saved in bookmarks & Personal Cookbook
    this.saveRecipe(userId, numId)
    syncBookmarkCollections(userId, numId, list)
    return this.getUserCollections(userId)
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
    return list.filter(
      (cust) =>
        String(cust.userId) === String(userId) && recipeStorage.getById(cust.recipeId) !== null
    )
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

    const cleanSubstitutions = Array.isArray(customizationData.substitutions)
      ? customizationData.substitutions
          .filter((s) => s && (s.original?.trim() || s.replacement?.trim()))
          .map((s) => ({
            original: s.original?.trim() || '',
            replacement: s.replacement?.trim() || ''
          }))
      : []

    if (
      cleanSubstitutions.length === 0 &&
      (customizationData.ingredientReplaced?.trim() || customizationData.replacementIngredient?.trim())
    ) {
      cleanSubstitutions.push({
        original: customizationData.ingredientReplaced?.trim() || '',
        replacement: customizationData.replacementIngredient?.trim() || ''
      })
    }

    const cleanIngredients = Array.isArray(customizationData.modifiedIngredients)
      ? customizationData.modifiedIngredients.map((item) => String(item).trim()).filter(Boolean)
      : []

    const cleanInstructions = Array.isArray(customizationData.modifiedInstructions)
      ? customizationData.modifiedInstructions.map((step) => String(step).trim()).filter(Boolean)
      : []

    const cleanTags = Array.isArray(customizationData.personalTags)
      ? Array.from(new Set(customizationData.personalTags.map((t) => String(t).trim()).filter(Boolean)))
      : []

    const primarySwap = cleanSubstitutions[0]
    const parsedServings = Number(customizationData.customServings)

    const updatedEntry = {
      id: `cust_${userId}_${recipeId}`,
      userId: String(userId),
      recipeId: Number(recipeId),
      originalTitle: customizationData.originalTitle || 'Recipe',
      customTitle: customizationData.customTitle?.trim() || `${customizationData.originalTitle || 'Recipe'} · My version`,
      ingredientReplaced: primarySwap ? primarySwap.original : (customizationData.ingredientReplaced || ''),
      replacementIngredient: primarySwap ? primarySwap.replacement : (customizationData.replacementIngredient || ''),
      substitutions: cleanSubstitutions,
      personalNotes: customizationData.personalNotes?.trim() || '',
      modifiedIngredients: cleanIngredients,
      modifiedInstructions: cleanInstructions,
      personalTags: cleanTags,
      collectionId: customizationData.collectionId || null,
      collectionName: customizationData.collectionName || '',
      allergenNotes: customizationData.allergenNotes || '',
      customCookTime: customizationData.customCookTime ? Number(customizationData.customCookTime) : undefined,
      customServings: !isNaN(parsedServings) && parsedServings > 0 ? parsedServings : undefined,
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
    if (!userId || recipeId === undefined || recipeId === null) {
      throw new Error('User ID and Recipe ID are required.')
    }
    const list = getCustomizationsList()
    const filtered = list.filter(
      (c) => !(String(c.userId) === String(userId) && isSameRecipeId(c.recipeId, recipeId))
    )
    if (filtered.length !== list.length) {
      persistCustomizationsList(filtered)
    }
    return true
  },

  /**
   * Reset a user's saved customization back to the unmodified original recipe
   * without touching bookmarks, cookbook collections, or other users' data.
   */
  resetCustomization(userId, recipeId) {
    if (!userId || recipeId === undefined || recipeId === null) {
      throw new Error('User ID and Recipe ID are required.')
    }
    this.deleteCustomization(userId, recipeId)
    return recipeStorage.getById(recipeId)
  },

  /**
   * Remove all saved entries, collection references, and customization records
   * referencing a deleted recipe across all users without deleting collections or other recipes.
   */
  removeRecipeReferences(recipeId) {
    if (recipeId === undefined || recipeId === null) {
      return {
        removedFromSavedCount: 0,
        removedFromCollectionsCount: 0,
        removedCustomizationsCount: 0
      }
    }

    // 1. Clean SAVED_RECIPES map
    const savedMap = getSavedMap()
    let removedFromSavedCount = 0
    let savedChanged = false
    Object.keys(savedMap).forEach((uKey) => {
      const current = Array.isArray(savedMap[uKey]) ? savedMap[uKey] : []
      const filtered = current.filter((id) => !isSameRecipeId(id, recipeId))
      if (filtered.length !== current.length) {
        removedFromSavedCount += current.length - filtered.length
        savedMap[uKey] = filtered
        savedChanged = true
      }
    })
    if (savedChanged) {
      persistSavedMap(savedMap)
    }

    // 2. Clean collection.recipeIds references (preserve all collection objects)
    const collections = getCollectionsList()
    const now = new Date().toISOString()
    let removedFromCollectionsCount = 0
    let colsChanged = false
    const updatedCollections = collections.map((col) => {
      const currentIds = Array.isArray(col.recipeIds) ? col.recipeIds : []
      const filteredIds = currentIds.filter((id) => !isSameRecipeId(id, recipeId))
      if (filteredIds.length !== currentIds.length) {
        removedFromCollectionsCount += currentIds.length - filteredIds.length
        colsChanged = true
        return {
          ...col,
          recipeIds: filteredIds,
          updatedAt: now
        }
      }
      return col
    })
    if (colsChanged) {
      persistCollectionsList(updatedCollections)
    }

    // 3. Clean customization records for the deleted recipe
    const customizations = getCustomizationsList()
    const filteredCusts = customizations.filter((c) => !isSameRecipeId(c.recipeId, recipeId))
    const removedCustomizationsCount = customizations.length - filteredCusts.length
    if (removedCustomizationsCount > 0) {
      persistCustomizationsList(filteredCusts)
    }

    return {
      removedFromSavedCount,
      removedFromCollectionsCount,
      removedCustomizationsCount
    }
  },

  resetDefaults() {
    persistSavedMap(cloneSavedMap(DEFAULT_SAVED_MAP))
    persistCollectionsList(cloneCollections(DEFAULT_COLLECTIONS))
    persistCustomizationsList(cloneCustomizations(DEFAULT_CUSTOMIZATIONS))
    bookmarkStorage.resetDefaults()
  }
}
