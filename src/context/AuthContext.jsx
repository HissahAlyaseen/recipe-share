import { useState, useEffect } from 'react'
import { AuthContext } from './authContextDef'
import { STORAGE_KEYS } from '../services/storageKeys'

/**
 * Isolated Auth Provider with fallback user for development.
 * Aligns with Figma wireframes ('Amal', 'amal@kfupm.edu.sa', id: 'user-1').
 * When Member 1 provides the production authentication system,
 * this provider can be replaced with zero changes to Member 2's components.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUserId = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID)
      return {
        id: savedUserId || 'user-1',
        name: 'Amal',
        email: 'amal@kfupm.edu.sa',
        username: 'Amal_cooks',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
      }
    } catch {
      return {
        id: 'user-1',
        name: 'Amal',
        email: 'amal@kfupm.edu.sa',
        username: 'Amal_cooks',
        avatar: ''
      }
    }
  })

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, user.id)
    }
  }, [user])

  const updateUser = (updatedFields) => {
    setUser((prev) => ({ ...prev, ...updatedFields }))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
