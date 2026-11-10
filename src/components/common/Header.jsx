import { useState, useRef, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { STORAGE_KEYS, STORAGE_SYNC_VERSION } from '../../services/storageKeys'
import { recipeStorage } from '../../services/recipeStorage'
import { cookbookStorage } from '../../services/cookbookStorage'
import { profileStorage } from '../../services/profileStorage'
import { bookmarkStorage } from '../../services/bookmarkStorage'
import './Header.css'

export default function Header() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleResetStorage = () => {
    try {
      localStorage.clear()
      recipeStorage.resetDefaults()
      cookbookStorage.resetDefaults()
      profileStorage.resetDefaults()
      bookmarkStorage.resetDefaults()
      localStorage.setItem(STORAGE_KEYS.STORAGE_VERSION, STORAGE_SYNC_VERSION)
      window.location.reload()
    } catch (err) {
      console.error('Failed to reset storage:', err)
    }
  }

  return (
    <header className="app-header">
      <div className="header-container">
        <NavLink to="/" className="brand-logo" title="Recipe Share">
          <span className="brand-icon">🍽️</span>
          <span className="brand-name">Recipe Share</span>
        </NavLink>

        <nav className="desktop-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/my-recipes"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            My Recipes
          </NavLink>
          <NavLink
            to="/cookbook"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Cookbooks
          </NavLink>
        </nav>

        {/* Global User Profile with hover / click dropdown wrapper */}
        <div
          className={`header-user-section ${isOpen ? 'open' : ''}`}
          ref={dropdownRef}
        >
          <button
            type="button"
            className="profile-badge"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <span className="profile-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </span>
            <span className="profile-name">{user?.name || 'User'}</span>
            <span className="profile-caret">▾</span>
          </button>

          {/* Profile Dropdown Wrapper */}
          <div className="profile-dropdown-wrapper" role="menu">
            <Link
              to="/profile"
              className="dropdown-user-info"
              onClick={() => setIsOpen(false)}
              title="View profile and dietary preferences"
            >
              <div className="dropdown-user-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="dropdown-user-text">
                <span className="dropdown-user-name">{user?.name || 'User'}</span>
                <span className="dropdown-user-email">{user?.email || 'user@university.edu'}</span>
              </div>
            </Link>

            <div className="dropdown-divider" />

            <div className="dropdown-actions">
              <button
                type="button"
                className="dropdown-reset-btn"
                onClick={handleResetStorage}
                title="Reset local storage to Figma sample data"
              >
                <span className="reset-btn-icon">🔄</span>
                <div className="reset-btn-content">
                  <span className="reset-btn-title">Reset Sample Data</span>
                  <span className="reset-btn-subtitle">Restore default recipes & collections</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
