/**
 * LocalStorage keys used throughout the application.
 * Centralized here to avoid key collision and make backend transition straightforward.
 */
export const STORAGE_SYNC_VERSION = 'v13'

export const STORAGE_KEYS = {
  RECIPES: 'recipe_share_recipes',
  SAVED_RECIPES: 'recipe_share_saved_recipes',
  BOOKMARKS: 'recipe_share_bookmarks',
  COLLECTIONS: 'recipe_share_collections',
  CUSTOMIZATIONS: 'recipe_share_customizations',
  USER_PROFILES: 'recipe_share_user_profiles',
  ACTIVE_USER_ID: 'recipe_share_active_user_id',
  STORAGE_VERSION: 'recipe_share_storage_version'
}

