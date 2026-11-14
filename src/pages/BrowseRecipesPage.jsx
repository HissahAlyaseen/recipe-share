import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useStorageSync } from '../hooks/useStorageSync'
import { recipeStorage, RECIPES_UPDATED_EVENT } from '../services/recipeStorage'
import {
  profileStorage,
  extractPreferences,
  hasExplicitPreferences
} from '../services/profileStorage'
import { matchesUserDietaryPreferences } from '../utils/dietaryUtils'
import Header from '../components/common/Header'
import BottomNav from '../components/common/BottomNav'
import RecipeCard from '../components/common/RecipeCard'
import './BrowseRecipesPage.css'

export default function BrowseRecipesPage() {
  const { user, isAuthenticated } = useAuth()
  const activeUserId = isAuthenticated === false ? null : user?.id || null

 const [recipes, setRecipes] = useState(() => {
  const all = recipeStorage.getAll()

  return all.filter(
    (r) =>
      !r.status ||
      r.status.toLowerCase() === 'published'
  )
})

  useStorageSync([RECIPES_UPDATED_EVENT], () => {
  const all = recipeStorage.getAll()

  setRecipes(
    all.filter(
      (r) =>
        !r.status ||
        r.status.toLowerCase() === 'published'
    )
  )
})
  const [filterByPreferences, setFilterByPreferences] = useState(false)

  const userProfile = useMemo(() => {
    if (!activeUserId) return null
    if (hasExplicitPreferences(user)) return user
    return profileStorage.getProfile(activeUserId, user)
  }, [activeUserId, user])

  const userPrefs = useMemo(() => extractPreferences(userProfile || {}), [userProfile])
  const hasPrefs =
    userPrefs.dietPreferences.length > 0 ||
    userPrefs.allergensToAvoid.length > 0 ||
    userPrefs.customDietaryRestrictions.length > 0

  const visibleRecipes = useMemo(() => {
    if (!filterByPreferences || !hasPrefs || !userProfile) return recipes
    return recipes.filter((r) => matchesUserDietaryPreferences(r, userProfile))
  }, [recipes, filterByPreferences, hasPrefs, userProfile])

  const communityRecipes = activeUserId
    ? visibleRecipes.filter((r) => String(r.authorId) !== String(activeUserId))
    : visibleRecipes
  const ownRecipes = activeUserId
    ? visibleRecipes.filter((r) => String(r.authorId) === String(activeUserId))
    : []

  return (
    <div className="browse-recipes-wrapper">
      <Header />

      <main className="browse-recipes-main">
        <div className="browse-recipes-container">
          <div className="top-nav-link-row">
            <Link to="/cookbook" className="back-link">
              ‹ Back to Cookbooks
            </Link>
          </div>

          <header className="browse-header-block">
            <h1 className="browse-title">Find more recipes</h1>
            <p className="browse-subtitle">
              Explore recipes shared by other cooks and bookmark favorites to your Personal Cookbook.
            </p>
          </header>

          {activeUserId && hasPrefs && (
            <div className="browse-preferences-bar" role="region" aria-label="Dietary preference filter">
              <div className="browse-prefs-info">
                <div className="browse-prefs-heading-row">
                  <span className="browse-prefs-label">Your dietary profile</span>
                  <Link to="/profile?view=preferences" className="browse-prefs-edit-link">
                    Edit preferences
                  </Link>
                </div>
                <div className="browse-prefs-chips">
                  {userPrefs.dietPreferences.map((diet) => (
                    <span key={diet} className="browse-pref-chip">
                      {diet}
                    </span>
                  ))}
                  {userPrefs.allergensToAvoid.map((allergen) => (
                    <span key={allergen} className="browse-pref-chip avoid">
                      No {allergen.toLowerCase()}
                    </span>
                  ))}
                  {userPrefs.customDietaryRestrictions.map((restriction) => (
                    <span key={`custom-${restriction}`} className="browse-pref-chip custom">
                      {restriction}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className={`btn-pref-filter-toggle ${filterByPreferences ? 'active' : ''}`}
                onClick={() => setFilterByPreferences((prev) => !prev)}
                aria-pressed={filterByPreferences}
              >
                {filterByPreferences ? '✓ Filtering by preferences' : 'Filter by my preferences'}
              </button>
            </div>
          )}

          {/* Recipes shared by other users */}
          {communityRecipes.length > 0 && (
            <section className="browse-section">
              <div className="browse-section-header">
                <h2 className="browse-section-title">Shared by other cooks</h2>
                <span className="browse-count">
                  {communityRecipes.length} {communityRecipes.length === 1 ? 'recipe' : 'recipes'}
                </span>
              </div>

              <div className="browse-cards-grid">
                {communityRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            </section>
          )}

          {/* User's own published recipes */}
          {ownRecipes.length > 0 && (
            <section className="browse-section">
              <div className="browse-section-header">
                <h2 className="browse-section-title">More recipes</h2>
                <span className="browse-count">
                  {ownRecipes.length} {ownRecipes.length === 1 ? 'recipe' : 'recipes'}
                </span>
              </div>

              <div className="browse-cards-grid">
                {ownRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            </section>
          )}

          {visibleRecipes.length === 0 && (
            <div className="empty-browse-card">
              <p className="empty-browse-title">
                {filterByPreferences
                  ? 'No recipes match all of your active preferences'
                  : 'No recipes available yet'}
              </p>
              <p className="empty-browse-desc">
                {filterByPreferences
                  ? 'Try adjusting your dietary preferences or show all community recipes.'
                  : 'Check back soon or create a new recipe to share with the community.'}
              </p>
              {filterByPreferences ? (
                <button
                  type="button"
                  className="btn-browse-cta"
                  onClick={() => setFilterByPreferences(false)}
                >
                  Show all recipes
                </button>
              ) : (
                <Link to="/recipes/new" className="btn-browse-cta">
                  + Add recipe
                </Link>
              )}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
