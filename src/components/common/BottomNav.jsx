import { NavLink } from 'react-router-dom'
import './BottomNav.css'

export default function BottomNav() {
  return (
    <nav className="figma-bottom-nav" aria-label="Mobile Navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `figma-nav-tab ${isActive ? 'active' : ''}`}
      >
        <span className="tab-indicator" />
        <span className="tab-label">Home</span>
      </NavLink>

      <NavLink
        to="/my-recipes"
        className={({ isActive }) => `figma-nav-tab ${isActive ? 'active' : ''}`}
      >
        <span className="tab-indicator" />
        <span className="tab-label">My Recipes</span>
      </NavLink>

      <NavLink
        to="/cookbook"
        className={({ isActive }) => `figma-nav-tab ${isActive ? 'active' : ''}`}
      >
        <span className="tab-indicator" />
        <span className="tab-label">Cookbooks</span>
      </NavLink>

      <NavLink
        to="/meal-planner"
        className={({ isActive }) => `figma-nav-tab ${isActive ? 'active' : ''}`}
      >
        <span className="tab-indicator" />
        <span className="tab-label">Meal Planner</span>
      </NavLink>
    </nav>
  )
}
