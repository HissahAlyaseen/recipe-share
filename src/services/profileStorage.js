import { STORAGE_KEYS } from './storageKeys.js'

export const PROFILE_UPDATED_EVENT = 'recipe-share:profile-updated'

export const DIET_OPTIONS = [
  'Halal',
  'Vegetarian',
  'Vegan',
  'Keto',
  'Low-Carb',
  'Gluten-free',
  'Dairy-free',
  'Pescatarian',
  'Nut-free',
  'High-Protein'
]

export const ALLERGEN_OPTIONS = [
  'Peanuts',
  'Tree nuts',
  'Milk',
  'Eggs',
  'Wheat',
  'Soy',
  'Fish',
  'Shellfish',
  'Sesame'
]

function normalizeOptionList(list, canonicalOptions = []) {
  if (!Array.isArray(list)) return []
  const canonicalLookup = new Map(
    canonicalOptions.map((opt) => [opt.toLowerCase(), opt])
  )
  const seen = new Set()
  const result = []

  for (const item of list) {
    if (typeof item !== 'string' && typeof item !== 'number') continue
    const cleaned = String(item).trim().replace(/\s+/g, ' ')
    if (!cleaned) continue
    const lower = cleaned.toLowerCase()
    if (seen.has(lower)) continue
    seen.add(lower)
    result.push(canonicalLookup.get(lower) || cleaned)
  }

  return result
}

export function extractPreferences(source = {}) {
  if (!source || typeof source !== 'object') {
    return {
      dietPreferences: [],
      allergensToAvoid: [],
      customDietaryRestrictions: [],
      dietaryPreferences: {
        diets: [],
        allergens: [],
        customRestrictions: []
      }
    }
  }

  const nested =
    source.dietaryPreferences && !Array.isArray(source.dietaryPreferences)
      ? source.dietaryPreferences
      : null

  const rawDiets = Array.isArray(source.dietPreferences)
    ? source.dietPreferences
    : Array.isArray(source.dietaryPreferences)
      ? source.dietaryPreferences
      : Array.isArray(nested?.diets)
        ? nested.diets
        : []

  const rawAllergens = Array.isArray(source.allergensToAvoid)
    ? source.allergensToAvoid
    : Array.isArray(nested?.allergens)
      ? nested.allergens
      : []

  const rawCustom = Array.isArray(source.customDietaryRestrictions)
    ? source.customDietaryRestrictions
    : Array.isArray(source.customRestrictions)
      ? source.customRestrictions
      : Array.isArray(nested?.customRestrictions)
        ? nested.customRestrictions
        : []

  const dietPreferences = normalizeOptionList(rawDiets, DIET_OPTIONS)
  const allergensToAvoid = normalizeOptionList(rawAllergens, ALLERGEN_OPTIONS)
  const customDietaryRestrictions = normalizeOptionList(rawCustom)

  return {
    dietPreferences,
    allergensToAvoid,
    customDietaryRestrictions,
    dietaryPreferences: {
      diets: [...dietPreferences],
      allergens: [...allergensToAvoid],
      customRestrictions: [...customDietaryRestrictions]
    }
  }
}

export function hasExplicitPreferences(source) {
  if (!source || typeof source !== 'object') return false
  return Boolean(
    Array.isArray(source.dietPreferences) ||
      Array.isArray(source.allergensToAvoid) ||
      Array.isArray(source.customDietaryRestrictions) ||
      Array.isArray(source.customRestrictions) ||
      source.dietaryPreferences
  )
}

function buildStoredProfileRecord(data = {}) {
  const prefs = extractPreferences(data)
  return {
    id: String(data.id || ''),
    name: typeof data.name === 'string' ? data.name : '',
    email: typeof data.email === 'string' ? data.email : '',
    username: typeof data.username === 'string' ? data.username : '',
    avatar: typeof data.avatar === 'string' ? data.avatar : '',
    dietPreferences: prefs.dietPreferences,
    allergensToAvoid: prefs.allergensToAvoid,
    customDietaryRestrictions: prefs.customDietaryRestrictions,
    dietaryPreferences: prefs.dietaryPreferences,
    updatedAt: data.updatedAt || new Date().toISOString(),
    ...(data.isDefaultSeed ? { isDefaultSeed: true } : {})
  }
}

export function toSharedUserModel(profile, authUser = null) {
  if (!profile && !authUser) return null
  const mergedSource = {
    ...(authUser || {}),
    ...(profile || {})
  }
  const prefs = extractPreferences(mergedSource)
  const resolvedId = profile?.id || authUser?.id || ''

  return {
    ...(authUser || {}),
    ...(profile || {}),
    id: String(resolvedId),
    name:
      typeof profile?.name === 'string' && profile.name !== ''
        ? profile.name
        : typeof authUser?.name === 'string'
          ? authUser.name
          : '',
    email:
      typeof profile?.email === 'string' && profile.email !== ''
        ? profile.email
        : typeof authUser?.email === 'string'
          ? authUser.email
          : '',
    username:
      typeof profile?.username === 'string' && profile.username !== ''
        ? profile.username
        : typeof authUser?.username === 'string'
          ? authUser.username
          : '',
    avatar:
      typeof profile?.avatar === 'string' && profile.avatar !== ''
        ? profile.avatar
        : typeof authUser?.avatar === 'string'
          ? authUser.avatar
          : '',
    dietPreferences: prefs.dietPreferences,
    allergensToAvoid: prefs.allergensToAvoid,
    customDietaryRestrictions: prefs.customDietaryRestrictions,
    dietaryPreferences: prefs.dietaryPreferences,
    updatedAt: profile?.updatedAt || authUser?.updatedAt || new Date().toISOString()
  }
}

function stripInternalFlags(record) {
  if (!record) return null
  const clean = { ...record }
  delete clean.isDefaultSeed
  return toSharedUserModel(clean)
}

function createDefaultProfiles() {
  return {
    'user-1': buildStoredProfileRecord({
      id: 'user-1',
      name: 'Amal',
      email: 'amal@kfupm.edu.sa',
      username: 'Amal_cooks',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      dietPreferences: ['Vegetarian', 'Gluten-free'],
      allergensToAvoid: ['Peanuts'],
      customDietaryRestrictions: [],
      isDefaultSeed: true,
      updatedAt: '2026-10-25T10:00:00.000Z'
    })
  }
}

function getProfilesMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILES)
    if (!raw) {
      const defaults = createDefaultProfiles()
      localStorage.setItem(STORAGE_KEYS.USER_PROFILES, JSON.stringify(defaults))
      return defaults
    }
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      const defaults = createDefaultProfiles()
      localStorage.setItem(STORAGE_KEYS.USER_PROFILES, JSON.stringify(defaults))
      return defaults
    }
    return parsed
  } catch (err) {
    console.error('Failed to read user profiles from localStorage:', err)
    return createDefaultProfiles()
  }
}

function persistProfilesMap(map) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILES, JSON.stringify(map))
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT))
    }
  } catch (err) {
    console.error('Failed to persist user profiles to localStorage:', err)
  }
}

export const profileStorage = {
  getProfile(userId, authUser = null) {
    if (!userId) return null
    const key = String(userId)
    const map = getProfilesMap()
    const stored = map[key]

    // No saved record for this user yet -> derive from authenticated user (never hardcode another user)
    if (!stored) {
      const prefs = extractPreferences(authUser || {})
      return stripInternalFlags(
        buildStoredProfileRecord({
          id: key,
          name: authUser?.name || '',
          email: authUser?.email || '',
          username: authUser?.username || '',
          avatar: authUser?.avatar || '',
          ...prefs,
          updatedAt: authUser?.updatedAt || new Date().toISOString()
        })
      )
    }

    // If only default seed data exists and external auth provides a different user identity, respect authUser
    if (
      stored.isDefaultSeed &&
      authUser &&
      ((authUser.name && authUser.name !== stored.name) ||
        (authUser.email && authUser.email !== stored.email))
    ) {
      const prefs = hasExplicitPreferences(authUser)
        ? extractPreferences(authUser)
        : { dietPreferences: [], allergensToAvoid: [], customDietaryRestrictions: [] }
      return stripInternalFlags(
        buildStoredProfileRecord({
          id: key,
          name: authUser.name || '',
          email: authUser.email || '',
          username: authUser.username || '',
          avatar: authUser.avatar || '',
          ...prefs,
          updatedAt: authUser.updatedAt || new Date().toISOString()
        })
      )
    }

    return toSharedUserModel(stripInternalFlags(stored), authUser)
  },

  updateProfile(userId, updates = {}, authUser = null) {
    if (!userId) throw new Error('User ID is required to update profile.')
    const key = String(userId)
    const map = getProfilesMap()
    const current = this.getProfile(key, authUser) || { id: key }

    const resolvedDietPreferences =
      'dietPreferences' in updates
        ? updates.dietPreferences
        : 'dietaryPreferences' in updates
          ? extractPreferences(updates).dietPreferences
          : current.dietPreferences

    const resolvedAllergens =
      'allergensToAvoid' in updates
        ? updates.allergensToAvoid
        : 'dietaryPreferences' in updates && !Array.isArray(updates.dietaryPreferences)
          ? updates.dietaryPreferences?.allergens ?? current.allergensToAvoid
          : current.allergensToAvoid

    const resolvedCustomRestrictions =
      'customDietaryRestrictions' in updates
        ? updates.customDietaryRestrictions
        : 'customRestrictions' in updates
          ? updates.customRestrictions
          : 'dietaryPreferences' in updates && !Array.isArray(updates.dietaryPreferences)
            ? updates.dietaryPreferences?.customRestrictions ?? current.customDietaryRestrictions
            : current.customDietaryRestrictions

    const mergedInput = {
      ...current,
      ...updates,
      id: key,
      dietPreferences: Array.isArray(resolvedDietPreferences) ? resolvedDietPreferences : [],
      allergensToAvoid: Array.isArray(resolvedAllergens) ? resolvedAllergens : [],
      customDietaryRestrictions: Array.isArray(resolvedCustomRestrictions) ? resolvedCustomRestrictions : [],
      isDefaultSeed: false,
      updatedAt: new Date().toISOString()
    }
    delete mergedInput.dietaryPreferences
    delete mergedInput.customRestrictions

    const updatedRecord = buildStoredProfileRecord(mergedInput)

    map[key] = updatedRecord
    persistProfilesMap(map)
    return toSharedUserModel(stripInternalFlags(updatedRecord), authUser)
  },

  resetDefaults() {
    const defaults = createDefaultProfiles()
    persistProfilesMap(defaults)
    return defaults
  }
}
