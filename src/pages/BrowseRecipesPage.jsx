import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { recipeStorage } from '../services/recipeStorage'
import Header from '../components/common/Header'
import BottomNav from '../components/common/BottomNav'
import RecipeCard from '../components/common/RecipeCard'
import './BrowseRecipesPage.css'

export default function BrowseRecipesPage() {
  const { user } = useAuth()
  const userId = user?.id || 'user-1'

  const [recipes] = useState(() => {
    const all = recipeStorage.getAll()
    return all.filter((r) => !r.status || r.status.toLowerCase() !== 'draft')
  })

  const communityRecipes = recipes.filter((r) => String(r.authorId) !== String(userId))
  const ownRecipes = recipes.filter((r) => String(r.authorId) === String(userId))

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

          {recipes.length === 0 && (
            <div className="empty-browse-card">
              <p className="empty-browse-title">No recipes available yet</p>
              <p className="empty-browse-desc">
                Check back soon or create a new recipe to share with the community.
              </p>
              <Link to="/recipes/new" className="btn-browse-cta">
                + Add recipe
              </Link>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

