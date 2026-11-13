
import Header from '../components/common/Header'
import BottomNav from '../components/common/BottomNav'
import './HomePage.css'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { recipeStorage } from '../services/recipeStorage'
import RecipeCard from '../components/common/RecipeCard'
import { extractPreferences } from '../services/profileStorage'

function HomePage() {
const { user } = useAuth()
const userPreferences = extractPreferences(user || {})

const dietaryPreferences = userPreferences.dietPreferences
const allergensToAvoid = userPreferences.allergensToAvoid
const [recipes] = useState(() => recipeStorage.getAll())

const featuredRecipes = recipes
  .filter((recipe) => recipe.status?.toLowerCase() !== 'draft')
  .slice(0, 4)
const [searchQuery, setSearchQuery] = useState('')
const navigate = useNavigate()

const handleSearch = (event) => {
  event.preventDefault()

  if (!searchQuery.trim()) return

  navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
}
  return (
    <div className="home-page">
      <Header />

      <main className="home-content">
        <h1>Welcome back, {user?.name || 'Chef'}! 👋</h1>
        <p>Discover recipes that fit your preferences.</p>

<form className="home-search" onSubmit={handleSearch}>
  <label htmlFor="home-search-input">
    Find your next recipe
  </label>

  <div className="home-search-row">
    <input
      id="home-search-input"
      type="search"
      placeholder="Search recipes or ingredients..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />

    <button type="submit">Search</button>
  </div>
</form>

<section className="home-preferences">
  <div className="home-preferences-header">
    <h2>Your Recipe Preferences</h2>

    <Link
      to="/profile?view=preferences"
      className="home-preferences-edit"
    >
      Edit
    </Link>
  </div>

  <div className="home-preferences-tags">
    {dietaryPreferences.map((diet) => (
      <span key={diet} className="home-preference-tag">
        {diet}
      </span>
    ))}

    {allergensToAvoid.map((allergen) => (
      <span key={allergen} className="home-preference-tag">
        Exclude {allergen}
      </span>
    ))}

    {dietaryPreferences.length === 0 &&
      allergensToAvoid.length === 0 && (
        <p>No preferences selected yet.</p>
      )}
  </div>

  <p className="home-preferences-note">
    Always check ingredients and product labels for allergens.
  </p>
</section>

<section className="home-recipes">
  <div className="home-recipes-header">
    <h2>For Your Table</h2>

    <Link to="/search" className="home-see-all">
      See all recipes
    </Link>
  </div>

  <p>Explore delicious recipes shared by our community.</p>

<div className="home-recipes-grid">
  {featuredRecipes.length > 0 ? (
    featuredRecipes.map((recipe) => (
      <RecipeCard
        key={recipe.id}
        recipe={recipe}
      />
    ))
  ) : (
    <p>No recipes available yet.</p>
  )}
</div>

</section>
      </main>

      <BottomNav />
    </div>
  )
}

export default HomePage
