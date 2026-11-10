import { STORAGE_KEYS } from './storageKeys.js'
import { recipeStorage } from './recipeStorage.js'

/**
 * Default Bookmarks Dataset
 * Conforms to Bookmark Data Model:
 * - id: unique bookmark ID
 * - userId: owner user ID
 * - recipeId: original recipe ID (number)
 * - createdAt: ISO timestamp
 * - collectionIds: optional array of assigned cookbook collections
 */
export const DEFAULT_BOOKMARKS = [
  {
    id: 'bm_user-1_1',
    userId: 'user-1',
    recipeId: 1,
    createdAt: '2026-10-16T10:00:00.000Z',
    collectionIds: ['col-1', 'col-3']
  },
  {
    id: 'bm_user-1_2',
    userId: 'user-1',
    recipeId: 2,
    createdAt: '2026-10-18T14:00:00.000Z',
    collectionIds: ['col-2', 'col-3']
  },
  {
    id: 'bm_user-1_4',
    userId: 'user-1',
    recipeId: 4,
    createdAt: '2026-10-20T09:30:00.000Z',
    collectionIds: ['col-1']
  },
  {
    id: 'bm_user-1_5',
    userId: 'user-1',
    recipeId: 5,
    createdAt: '2026-10-22T11:15:00.000Z',
    collectionIds: ['col-1']
  }
]

// --- Helper Functions ---

function getStoredBookmarks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(DEFAULT_BOOKMARKS))
      return DEFAULT_BOOKMARKS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : DEFAULT_BOOKMARKS
  } catch (err) {
    console.error('Failed to read bookmarks from localStorage:', err)
    return DEFAULT_BOOKMARKS
  }
}

export const BOOKMARKS_UPDATED_EVENT = 'recipe-share:bookmarks-updated'

function persistBookmarks(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(list))
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent(BOOKMARKS_UPDATED_EVENT))
    }
  } catch (err) {
    console.error('Failed to persist bookmarks to localStorage:', err)
  }
}

// --- Bookmark Service API ---

export const bookmarkStorage = {
  /**
   * Get all bookmarks across all users (internal/admin use).
   */
  getAllBookmarks() {
    return getStoredBookmarks()
  },

  /**
   * Get all bookmarks for a specific user (User Isolation).
   */
  getUserBookmarks(userId) {
    if (!userId) return []
    const all = getStoredBookmarks()
    return all.filter((b) => String(b.userId) === String(userId))
  },

  /**
   * Get array of numeric recipe IDs bookmarked by the user.
   * Cleans up orphaned recipe IDs if a recipe was deleted.
   */
  getUserBookmarkedRecipeIds(userId) {
    if (!userId) return []
    const bookmarks = this.getUserBookmarks(userId)
    return bookmarks
      .map((b) => Number(b.recipeId))
      .filter((id) => !isNaN(id) && recipeStorage.getById(id) !== null)
  },

  /**
   * Check whether a specific recipe is bookmarked by the user.
   */
  isBookmarked(userId, recipeId) {
    if (!userId || recipeId === undefined || recipeId === null) return false
    const numId = Number(recipeId)
    const bookmarks = this.getUserBookmarks(userId)
    return bookmarks.some((b) => Number(b.recipeId) === numId)
  },

  /**
   * Get specific bookmark record for (userId, recipeId).
   */
  getBookmark(userId, recipeId) {
    if (!userId || recipeId === undefined || recipeId === null) return null
    const numId = Number(recipeId)
    const bookmarks = this.getUserBookmarks(userId)
    return bookmarks.find((b) => Number(b.recipeId) === numId) || null
  },

  /**
   * Add a recipe bookmark.
   * Business Rules:
   * 1. Does not duplicate or modify original recipe.
   * 2. Prevents duplicate bookmarks for the same user and recipe.
   * 3. Attaches optional collection IDs.
   */
  addBookmark(userId, recipeId, collectionIds = []) {
    if (!userId) throw new Error('User ID is required to bookmark a recipe.')
    if (recipeId === undefined || recipeId === null) {
      throw new Error('Recipe ID is required.')
    }

    const numId = Number(recipeId)
    if (isNaN(numId)) throw new Error('Invalid recipe ID.')

    const all = getStoredBookmarks()
    const existingIndex = all.findIndex(
      (b) => String(b.userId) === String(userId) && Number(b.recipeId) === numId
    )

    // Prevent duplicate bookmarks: return existing if already saved
    if (existingIndex >= 0) {
      const existing = all[existingIndex]
      // Merge any newly specified collection IDs without duplicating
      if (Array.isArray(collectionIds) && collectionIds.length > 0) {
        const mergedCols = Array.from(new Set([...(existing.collectionIds || []), ...collectionIds]))
        existing.collectionIds = mergedCols
        all[existingIndex] = existing
        persistBookmarks(all)
      }
      return { bookmark: existing, isNew: false }
    }

    // Create new bookmark entry
    const newBookmark = {
      id: `bm_${userId}_${numId}_${Date.now()}`,
      userId: String(userId),
      recipeId: numId,
      createdAt: new Date().toISOString(),
      collectionIds: Array.isArray(collectionIds) ? Array.from(new Set(collectionIds)) : []
    }

    all.push(newBookmark)
    persistBookmarks(all)
    return { bookmark: newBookmark, isNew: true }
  },

  /**
   * Remove a bookmark for a specific recipe and user.
   */
  removeBookmark(userId, recipeId) {
    if (!userId || recipeId === undefined || recipeId === null) return false
    const numId = Number(recipeId)

    const all = getStoredBookmarks()
    const initialLen = all.length
    const filtered = all.filter(
      (b) => !(String(b.userId) === String(userId) && Number(b.recipeId) === numId)
    )

    if (filtered.length !== initialLen) {
      persistBookmarks(filtered)
      return true
    }
    return false
  },

  /**
   * Toggle bookmark status.
   * Returns: { isBookmarked: boolean, bookmark: object | null, message: string }
   */
  toggleBookmark(userId, recipeId, collectionIds = []) {
    const isCurrentlySaved = this.isBookmarked(userId, recipeId)
    const recipe = recipeStorage.getById(recipeId)
    const title = recipe?.title ? `"${recipe.title}"` : 'Recipe'

    if (isCurrentlySaved) {
      this.removeBookmark(userId, recipeId)
      return {
        isBookmarked: false,
        bookmark: null,
        message: `Removed ${title} from your saved recipes.`
      }
    } else {
      const { bookmark } = this.addBookmark(userId, recipeId, collectionIds)
      return {
        isBookmarked: true,
        bookmark,
        message: `Saved ${title} to your Personal Cookbook!`
      }
    }
  },

  /**
   * Update collection assignments for an existing bookmark.
   */
  updateBookmarkCollections(userId, recipeId, collectionIds = []) {
    const all = getStoredBookmarks()
    const numId = Number(recipeId)
    const index = all.findIndex(
      (b) => String(b.userId) === String(userId) && Number(b.recipeId) === numId
    )

    if (index === -1) {
      return this.addBookmark(userId, recipeId, collectionIds).bookmark
    }

    all[index].collectionIds = Array.from(new Set(collectionIds))
    persistBookmarks(all)
    return all[index]
  },

  /**
   * Reset to default bookmarks dataset.
   */
  resetDefaults() {
    persistBookmarks(DEFAULT_BOOKMARKS)
    return DEFAULT_BOOKMARKS
  }
}

