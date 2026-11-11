import { useState, useEffect, useRef } from 'react'
import { AuthContext } from './authContextDef'
import { STORAGE_KEYS } from '../services/storageKeys'
import { profileStorage, toSharedUserModel } from '../services/profileStorage'

const SAMPLE_USERS = {
  'user-1': {
    id: 'user-1',
    name: 'Amal',
    email: 'amal@kfupm.edu.sa',
    username: 'Amal_cooks',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  },
  'user-2': {
    id: 'user-2',
    name: 'Inaya',
    email: 'inaya@kfupm.edu.sa',
    username: 'Inaya_cooks',
    avatar: ''
  },
  'user-3': {
    id: 'user-3',
    name: 'Ayla',
    email: 'ayla@kfupm.edu.sa',
    username: 'Ayla_cooks',
    avatar: ''
  }
}

function getFallbackSeedForUser(userId) {
  const key = String(userId || 'user-1')
  return SAMPLE_USERS[key] || { id: key, name: '', email: '', username: '', avatar: '' }
}

function loadInitialUser() {
  try {
    const savedUserId = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID)
    if (savedUserId === '__guest__') {
      return null
    }
    const activeId = savedUserId || 'user-1'
    const fallbackSeed = getFallbackSeedForUser(activeId)
    const profile = profileStorage.getProfile(activeId, fallbackSeed)
    return toSharedUserModel(profile, fallbackSeed)
  } catch {
    const fallbackSeed = getFallbackSeedForUser('user-1')
    return toSharedUserModel(fallbackSeed, fallbackSeed)
  }
}

/**
 * Auth Provider connected to the shared user data model and profileStorage persistence.
 * Exposes { user, isAuthenticated, updateUser, switchUser } so user identity and dietary
 * preferences stay synchronized across components and survive browser refreshes.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadInitialUser)
  const userRef = useRef(user)

  useEffect(() => {
    userRef.current = user
    try {
      if (user?.id) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, user.id)
      }
    } catch (err) {
      console.error('Failed to persist active user ID:', err)
    }
  }, [user])

  const updateUser = (updatedFields) => {
    if (!updatedFields || typeof updatedFields !== 'object') return null
    const current = userRef.current
    if (!current?.id) return null
    const persisted = profileStorage.updateProfile(current.id, updatedFields, current)
    const nextUser = toSharedUserModel(persisted, current)
    userRef.current = nextUser
    setUser(nextUser)
    return nextUser
  }

  const switchUser = (nextUserOrId) => {
    if (!nextUserOrId) {
      userRef.current = null
      setUser(null)
      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, '__guest__')
      } catch {
        // ignore storage errors
      }
      return null
    }

    const isObj = typeof nextUserOrId === 'object'
    const nextId = String(isObj ? nextUserOrId.id : nextUserOrId)
    const fallbackSeed = isObj ? nextUserOrId : getFallbackSeedForUser(nextId)
    const profile = profileStorage.getProfile(nextId, fallbackSeed)
    const nextUser = toSharedUserModel(profile, fallbackSeed)
    userRef.current = nextUser
    setUser(nextUser)
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, nextId)
    } catch {
      // ignore storage errors
    }
    return nextUser
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        updateUser,
        switchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
