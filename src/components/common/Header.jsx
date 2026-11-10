import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './Header.css'

export default function Header() {
  const { user } = useAuth()

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
        </nav>

        <div className="header-user-section">
          <div className="profile-badge" title={`Signed in as ${user?.name || 'Alex'}`}>
            <span className="profile-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </span>
            <span className="profile-name">{user?.name || 'Alex'}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
