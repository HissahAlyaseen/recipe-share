import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './Header.css'

export default function Header() {
  const { user } = useAuth()

  return (
    <header className="app-header">
      <div className="header-container">
        <NavLink to="/my-recipes" className="brand-logo" title="Recipe Share - Personal Hub">
          <span className="brand-icon">🍽️</span>
          <span className="brand-name">Recipe Share</span>
        </NavLink>

        <nav className="desktop-nav">
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
          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Profile & Preferences
          </NavLink>
        </nav>

        <div className="header-user-section">
          <NavLink
            to="/profile"
            className={({ isActive }) => `profile-badge ${isActive ? 'active' : ''}`}
            title="View Profile"
          >
            <span className="profile-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </span>
            <span className="profile-name">{user?.name || 'Profile'}</span>
          </NavLink>
        </div>
      </div>
    </header>
  )
}
