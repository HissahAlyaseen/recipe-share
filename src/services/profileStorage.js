import { STORAGE_KEYS } from './storageKeys.js'

const DEFAULT_PROFILES = {
  'user-1': {
    id: 'user-1',
    name: 'Alex',
    email: 'alex@university.edu',
    dietPreferences: ['Vegetarian', 'Gluten-free'],
    allergensToAvoid: ['Peanuts'],
    updatedAt: '2026-10-25T10:00:00.000Z'
  }
}

function getProfilesMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILES)
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILES, JSON.stringify(DEFAULT_PROFILES))
      return DEFAULT_PROFILES
    }
    return JSON.parse(raw)
  } catch (err) {
    console.error('Failed to read user profiles from localStorage:', err)
    return DEFAULT_PROFILES
  }
}

function persistProfilesMap(map) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILES, JSON.stringify(map))
  } catch (err) {
    console.error('Failed to persist user profiles to localStorage:', err)
  }
}

export const profileStorage = {
  getProfile(userId) {
    if (!userId) return null
    const map = getProfilesMap()
    return (
      map[String(userId)] || {
        id: String(userId),
        name: 'Alex',
        email: 'alex@university.edu',
        dietPreferences: [],
        allergensToAvoid: [],
        updatedAt: new Date().toISOString()
      }
    )
  },

  updateProfile(userId, updates) {
    if (!userId) throw new Error('User ID is required to update profile.')
    const map = getProfilesMap()
    const current = this.getProfile(userId)
    const updated = {
      ...current,
      ...updates,
      id: String(userId),
      updatedAt: new Date().toISOString()
    }
    map[String(userId)] = updated
    persistProfilesMap(map)
    return updated
  }
}
