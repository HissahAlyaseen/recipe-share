import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { recipeStorage } from '../services/recipeStorage'
import { cookbookStorage } from '../services/cookbookStorage'
import { useAuth } from '../hooks/useAuth'
import Header from '../components/common/Header'
import BottomNav from '../components/common/BottomNav'
import Toast from '../components/common/Toast'
import BookmarkButton from '../components/common/BookmarkButton'
import SaveToCookbookModal from '../components/cookbook/SaveToCookbookModal'
import './RecipeDetailsPage.css'

export default function RecipeDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const userId = user?.id || 'user-1'

  // Read recipe dynamically from storage whenever :id route param changes
  const recipe = recipeStorage.getById(id)
  const [collections, setCollections] = useState(() => cookbookStorage.getUserCollections(userId))
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const handleConfirmSave = (recipeId, targetColIds) => {
    const idList = Array.isArray(targetColIds)
      ? targetColIds
      : targetColIds
        ? [targetColIds]
        : []
    try {
      const updatedCols = cookbookStorage.setRecipeCollections(userId, recipeId, idList)
      setCollections(updatedCols)
      const selectedCols = updatedCols.filter((c) => idList.includes(String(c.id)))
      setToast({
        type: 'success',
        message:
          selectedCols.length > 0
            ? `Saved to "${selectedCols.map((c) => c.name).join(', ')}" in your Cookbook!`
            : `Saved "${recipe.title}" to your Cookbook!`
      })
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to save recipe.' })
    }
  }

  const handleCreateCollection = ({ name, description }) => {
    try {
      const created = cookbookStorage.createCollection(userId, { name, description })
      setCollections(cookbookStorage.getUserCollections(userId))
      return created
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to create collection.' })
      return null
    }
  }

  if (!recipe) {
    return (
      <div className="recipe-details-wrapper">
        <Header />
        <div className="details-container">
          <div className="not-found-card">
            <h2>Recipe Not Found</h2>
            <p>The recipe you are looking for does not exist or has been removed.</p>
            <Link to="/my-recipes" className="btn-back-home">
              Go to My Recipes
            </Link>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  const isAuthor = user?.id && String(recipe.authorId) === String(user.id)

  return (
    <div className="recipe-details-wrapper">
      <Header />

      <main className="details-main">
        <div className="details-container">
          {/* Back link */}
          <div className="top-nav-link-row">
            <button
              type="button"
              className="back-btn-text"
              onClick={() => navigate(-1)}
            >
              ‹ Back
            </button>
          </div>

          <header className="details-page-header">
            <h1 className="details-heading">Recipe details</h1>
          </header>

          {/* Photo banner with integrated BookmarkButton */}
          <div className="details-image-banner">
            <div className="banner-bookmark-btn">
              <BookmarkButton
                recipeId={recipe.id}
                recipe={recipe}
                variant="icon"
                size="md"
                showToast={true}
              />
            </div>
            {recipe.image ? (
              <img src={recipe.image} alt={recipe.title} className="details-cover-img" />
            ) : (
              <div className="details-placeholder-box">
                <span className="placeholder-icon">🍲</span>
                <span>{recipe.title} · photo</span>
              </div>
            )}
          </div>

          {/* Title & Metadata */}
          <div className="details-meta-block">
            <h2 className="recipe-headline">{recipe.title}</h2>
            <p className="recipe-author-subtitle">
              Shared by {recipe.authorName || 'Home Cook'}
              {isAuthor && <span className="author-badge">You</span>}
            </p>

            <div className="meta-info-row">
              <span className="meta-pill">⏱️ {recipe.cookingTime || 15} min</span>
              <span className="meta-pill">👥 {recipe.servings || 2} servings</span>
              {recipe.difficulty && (
                <span className="meta-pill">📊 {recipe.difficulty}</span>
              )}
              {recipe.category && (
                <span className="meta-pill">🏷️ {recipe.category}</span>
              )}
            </div>

            {/* Dietary Tags */}
            {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
              <div className="dietary-tags-list">
                {recipe.dietaryTags.map((tag) => (
                  <span key={tag} className="recipe-tag-chip">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Allergy Note */}
            <p className="allergy-disclaimer">
              User-provided recipe information. Always check ingredient labels and cross-contact
              risks before cooking.
            </p>
          </div>

          <hr className="details-hr" />

          {/* Ingredients */}
          <section className="details-section">
            <h3 className="section-header">
              Ingredients · {recipe.servings || 2} servings
            </h3>
            <ul className="ingredients-checklist">
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                recipe.ingredients.map((item, idx) => (
                  <li key={idx} className="ingredient-list-item">
                    <span className="ing-bullet">•</span>
                    <span className="ing-text">{item}</span>
                  </li>
                ))
              ) : (
                <li className="no-items-text">No ingredients specified.</li>
              )}
            </ul>
          </section>

          <hr className="details-hr" />

          {/* Instructions */}
          <section className="details-section">
            <h3 className="section-header">Preparation</h3>
            <ol className="instructions-list">
              {recipe.instructions && recipe.instructions.length > 0 ? (
                recipe.instructions.map((step, idx) => (
                  <li key={idx} className="instruction-step">
                    <span className="step-number">{idx + 1}.</span>
                    <span className="step-content">{step}</span>
                  </li>
                ))
              ) : (
                <li className="no-items-text">No preparation instructions provided.</li>
              )}
            </ol>
          </section>

          {/* Bottom Action buttons */}
          <div className="details-action-bar">
            {isAuthor && (
              <Link to={`/recipes/${recipe.id}/edit`} className="btn-edit-recipe-details">
                Edit Recipe
              </Link>
            )}

            <BookmarkButton
              recipeId={recipe.id}
              recipe={recipe}
              showLabel={true}
              variant="button"
              size="md"
              showToast={true}
            />

            <button
              type="button"
              className="btn-organize-collection"
              onClick={() => {
                setCollections(cookbookStorage.getUserCollections(userId))
                setIsSaveModalOpen(true)
              }}
              title="Assign recipe to a specific cookbook collection"
            >
              Organize in Collection
            </button>
          </div>
        </div>
      </main>

      {/* Save to Cookbook Modal matching Figma */}
      <SaveToCookbookModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        recipe={recipe}
        collections={collections}
        onSave={handleConfirmSave}
        onCreateCollection={handleCreateCollection}
      />

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
