import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useStorageSync } from '../hooks/useStorageSync'
import { recipeStorage, RECIPES_UPDATED_EVENT } from '../services/recipeStorage'
import Modal from '../components/common/Modal'
import Toast from '../components/common/Toast'
import Header from '../components/common/Header'
import BottomNav from '../components/common/BottomNav'
import './MyRecipesPage.css'

export default function MyRecipesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()
  const activeUserId = isAuthenticated === false ? null : user?.id || null

  // Initialize recipes directly from storage
  const [recipes, setRecipes] = useState(() => {
    return activeUserId ? recipeStorage.getByAuthor(activeUserId) : []
  })
  const [prevUserId, setPrevUserId] = useState(activeUserId)
  if (prevUserId !== activeUserId) {
    setPrevUserId(activeUserId)
    setRecipes(activeUserId ? recipeStorage.getByAuthor(activeUserId) : [])
  }

  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent') // 'recent' | 'title' | 'time'

  // Initialize toast if arriving after creation
  const [toast, setToast] = useState(() => {
    if (location.state?.newlyCreatedId) {
      return {
        type: 'success',
        message: 'Recipe created and saved to My Recipes successfully!'
      }
    }
    return null
  })

  // Delete modal state
  const [recipeToDelete, setRecipeToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const refreshRecipes = () => {
    setRecipes(activeUserId ? recipeStorage.getByAuthor(activeUserId) : [])
  }

  useStorageSync([RECIPES_UPDATED_EVENT], refreshRecipes)

  // Filter and sort recipes
  const filteredRecipes = recipes
    .filter((r) => {
      if (!searchTerm.trim()) return true
      return r.title.toLowerCase().includes(searchTerm.toLowerCase().trim())
    })
    .sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      }
      if (sortBy === 'time') {
        return (Number(a.cookingTime) || 0) - (Number(b.cookingTime) || 0)
      }
      // 'recent' by default: most recently edited first (falls back to creation date)
      return (
        new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)
      )
    })

  // Delete handler
  const handleConfirmDelete = () => {
    if (!recipeToDelete) return
    if (!activeUserId) {
      setToast({
        type: 'error',
        message: 'Please sign in to delete recipes.'
      })
      return
    }
    setIsDeleting(true)

    try {
      recipeStorage.delete(recipeToDelete.id, activeUserId)
      setToast({
        type: 'success',
        message: `"${recipeToDelete.title}" has been deleted.`
      })
      setRecipeToDelete(null)
      refreshRecipes()
    } catch (err) {
      console.error('Failed to delete recipe:', err)
      setToast({
        type: 'error',
        message: err.message || 'Failed to delete recipe.'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="my-recipes-page-wrapper">
      <Header />

      <main className="my-recipes-main">
        <div className="my-recipes-container">
          {/* Back to profile link matching Figma */}
          <div className="top-nav-link-row">
            <Link to="/profile" className="back-link">
              ‹ Back to profile
            </Link>
          </div>

          <header className="page-heading-block">
            <h1 className="page-title">My recipes</h1>
            <p className="page-subtitle">
              Recipes you created. Saved recipes by other cooks are in{' '}
              <Link to="/cookbook" style={{ color: '#111827', textDecoration: 'underline', fontWeight: 600 }}>
                My Cookbooks
              </Link>
              .
            </p>
          </header>

          {/* Add Recipe Primary Button matching Figma */}
          <button
            type="button"
            className="btn-add-recipe-primary"
            onClick={() => navigate('/recipes/new')}
          >
            + Add recipe
          </button>

          {/* Find your recipes search bar matching Figma */}
          <div className="search-section">
            <label htmlFor="search-input" className="search-label">
              Find your recipes
            </label>
            <div className="search-input-box">
              <input
                id="search-input"
                type="text"
                className="search-input"
                placeholder="Search by title"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm ? (
                <button
                  type="button"
                  className="btn-search"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  Clear
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-search"
                  onClick={() => document.getElementById('search-input')?.focus()}
                >
                  Search
                </button>
              )}
            </div>
          </div>

          {/* Results count & Sort row */}
          <div className="results-header-row">
            <span className="results-count">
              {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
            </span>
            <div className="sort-wrapper">
              <label htmlFor="sort-select" className="sort-label">
                Sort:
              </label>
              <select
                id="sort-select"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Recently edited ▾</option>
                <option value="title">Title A-Z ▾</option>
                <option value="time">Cooking time ▾</option>
              </select>
            </div>
          </div>

          {/* Recipe List */}
          <div className="recipes-list-grid">
            {filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe) => (
                <article key={recipe.id} className="recipe-list-card">
                  <div className="recipe-card-thumb">
                    {recipe.image ? (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="thumb-img"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="thumb-placeholder">
                        <span className="thumb-icon-rect" />
                        <span className="thumb-text">Recipe photo</span>
                      </div>
                    )}
                  </div>

                  <div className="recipe-card-content">
                    <h3 className="recipe-card-title">{recipe.title}</h3>
                    <div className="recipe-card-meta">
                      <span>{recipe.status || 'Published'}</span>
                      <span className="meta-sep">·</span>
                      <span>{recipe.cookingTime || 15} min</span>
                      <span className="meta-sep">·</span>
                      <span>{recipe.servings || 2} servings</span>
                    </div>

                    {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
                      <div className="card-dietary-chips">
                        {recipe.dietaryTags.map((tag) => (
                          <span key={tag} className="card-chip">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="recipe-card-author">
                      Created by {recipe.authorName || user?.name || ''}
                    </div>

                    <div className="recipe-card-actions">
                      <Link to={`/recipes/${recipe.id}`} className="action-link">
                        View
                      </Link>
                      <span className="action-sep">·</span>
                      <Link to={`/recipes/${recipe.id}/edit`} className="action-link">
                        Edit
                      </Link>
                      <span className="action-sep">·</span>
                      <button
                        type="button"
                        className="action-link-btn delete-action"
                        onClick={() => setRecipeToDelete(recipe)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-recipes-card">
                <p className="empty-title">No recipes found.</p>
                <p className="empty-desc">
                  {searchTerm
                    ? `No recipes matching "${searchTerm}". Try a different title.`
                    : "You haven't published any recipes yet. Click '+ Add recipe' above to get started!"}
                </p>
                {searchTerm && (
                  <button
                    type="button"
                    className="btn-clear-search"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Info callout matching Figma wireframe */}
          <div className="info-callout-card">
            <h4 className="info-callout-title">Your recipes, your changes</h4>
            <p className="info-callout-text">
              Edit opens the recipe form. Deleting a recipe requires confirmation and cannot be
              undone.
            </p>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal matching Figma 'delete recipe.jpg' */}
      <Modal
        isOpen={!!recipeToDelete}
        onClose={() => setRecipeToDelete(null)}
        maxWidth="440px"
        showCloseButton={false}
      >
        <div className="delete-modal-content">
          <h2 className="delete-modal-heading">Delete recipe confirmation</h2>
          <p className="delete-modal-subtitle">You are deleting your published recipe:</p>

          <h3 className="delete-recipe-title">{recipeToDelete?.title}</h3>

          <div className="delete-warning-box">
            <h4 className="warning-box-title">This cannot be undone</h4>
            <p className="warning-box-text">
              The recipe and its related bookmarks, collection references, and customizations will
              be removed. Choose Cancel to keep it.
            </p>
          </div>

          <div className="delete-modal-actions">
            <button
              type="button"
              className="btn-modal-delete"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete recipe'}
            </button>
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={() => setRecipeToDelete(null)}
              disabled={isDeleting}
            >
              Cancel · Keep recipe
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <BottomNav />
    </div>
  )
}
