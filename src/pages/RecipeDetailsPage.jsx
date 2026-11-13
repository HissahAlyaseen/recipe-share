import { useState } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { recipeStorage, RECIPES_UPDATED_EVENT } from '../services/recipeStorage'
import { cookbookStorage, COOKBOOK_UPDATED_EVENT } from '../services/cookbookStorage'
import { BOOKMARKS_UPDATED_EVENT } from '../services/bookmarkStorage'
import { profileStorage, hasExplicitPreferences } from '../services/profileStorage'
import { getRecipeDietaryConflicts } from '../utils/dietaryUtils'
import { useAuth } from '../hooks/useAuth'
import { useStorageSync } from '../hooks/useStorageSync'
import Header from '../components/common/Header'
import BottomNav from '../components/common/BottomNav'
import Toast from '../components/common/Toast'
import BookmarkButton from '../components/common/BookmarkButton'
import SaveToCookbookModal from '../components/cookbook/SaveToCookbookModal'
import ResetCustomizationModal from '../components/cookbook/ResetCustomizationModal'
import './RecipeDetailsPage.css'
import IngredientSubstitutions from '../components/recipes/IngredientSubstitutions'
import RatingsReviews from '../components/recipes/RatingsReviews'

export default function RecipeDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, isAuthenticated } = useAuth()

  const activeUserId = isAuthenticated === false ? null : user?.id || null

  // Read recipe dynamically from storage whenever :id route param changes
  const recipe = recipeStorage.getById(id)
  const customization = activeUserId && recipe ? cookbookStorage.getCustomization(activeUserId, recipe.id) : null
  const isViewingCustom = Boolean(customization) && searchParams.get('customized') !== 'false'

  const userProfile = activeUserId
    ? hasExplicitPreferences(user)
      ? user
      : profileStorage.getProfile(activeUserId, user)
    : null

  const [collections, setCollections] = useState(() =>
    activeUserId ? cookbookStorage.getUserCollections(activeUserId) : []
  )
  const [prevActiveUserId, setPrevActiveUserId] = useState(activeUserId)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [toast, setToast] = useState(null)

  if (prevActiveUserId !== activeUserId) {
    setPrevActiveUserId(activeUserId)
    setCollections(activeUserId ? cookbookStorage.getUserCollections(activeUserId) : [])
  }

  useStorageSync(
    [RECIPES_UPDATED_EVENT, BOOKMARKS_UPDATED_EVENT, COOKBOOK_UPDATED_EVENT],
    () => {
      setCollections(activeUserId ? cookbookStorage.getUserCollections(activeUserId) : [])
    }
  )

  const handleConfirmSave = (recipeId, targetColIds) => {
    if (!activeUserId) {
      setToast({ type: 'error', message: 'Please sign in to save recipes to collections.' })
      return
    }
    const idList = Array.isArray(targetColIds)
      ? targetColIds
      : targetColIds
        ? [targetColIds]
        : []
    try {
      const updatedCols = cookbookStorage.setRecipeCollections(activeUserId, recipeId, idList)
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

  const handleConfirmResetCustomization = () => {
    if (!activeUserId || !recipe) return
    try {
      cookbookStorage.resetCustomization(activeUserId, recipe.id)
      setIsResetModalOpen(false)
      if (searchParams.get('customized')) {
        setSearchParams({}, { replace: true })
      }
      setToast({
        type: 'info',
        message: 'Customization reset to the original recipe. Bookmark and collections preserved.'
      })
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to reset customization.' })
    }
  }

  const handleCreateCollection = ({ name, description }) => {
    if (!activeUserId) {
      setToast({ type: 'error', message: 'Please sign in to create cookbook collections.' })
      return null
    }
    try {
      const created = cookbookStorage.createCollection(activeUserId, { name, description })
      setCollections(cookbookStorage.getUserCollections(activeUserId))
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

  const isAuthor = activeUserId && String(recipe.authorId) === String(activeUserId)

  const displayedServings =
    isViewingCustom && customization.customServings ? customization.customServings : recipe.servings || 2
  const displayedIngredients =
    isViewingCustom && customization.modifiedIngredients?.length > 0
      ? customization.modifiedIngredients
      : recipe.ingredients || []
  const displayedInstructions =
    isViewingCustom && customization.modifiedInstructions?.length > 0
      ? customization.modifiedInstructions
      : recipe.instructions || []
  const displayedSubstitutions =
    isViewingCustom
      ? customization.substitutions?.length > 0
        ? customization.substitutions
        : customization.ingredientReplaced || customization.replacementIngredient
          ? [{ original: customization.ingredientReplaced, replacement: customization.replacementIngredient }]
          : []
      : []
  const displayedPersonalTags =
    isViewingCustom && Array.isArray(customization.personalTags) ? customization.personalTags : []
  const dietaryConflicts = userProfile
    ? getRecipeDietaryConflicts(recipe, userProfile, isViewingCustom ? displayedIngredients : null)
    : []

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

          {/* Private customization switcher banner when user has saved customizations */}
          {customization && (
            <div className="custom-version-banner" role="region" aria-label="Custom recipe toggle">
              <div className="custom-banner-text">
                <span className="custom-badge-pill">
                  {isViewingCustom ? 'My private version' : 'Original recipe'}
                </span>
                <span className="custom-banner-sub">
                  {isViewingCustom
                    ? `Private edits saved to your cookbook. ${recipe.authorName || 'Author'}'s original is unchanged.`
                    : `Viewing ${recipe.authorName || 'Author'}'s original recipe.`}
                </span>
              </div>
              <div className="custom-banner-controls">
                <div className="custom-version-toggle-group">
                  <button
                    type="button"
                    className={`version-toggle-btn ${isViewingCustom ? 'active' : ''}`}
                    onClick={() => setSearchParams({ customized: 'true' })}
                  >
                    My version
                  </button>
                  <button
                    type="button"
                    className={`version-toggle-btn ${!isViewingCustom ? 'active' : ''}`}
                    onClick={() => setSearchParams({ customized: 'false' })}
                  >
                    Original
                  </button>
                </div>
                <button
                  type="button"
                  className="btn-banner-reset-custom"
                  onClick={() => setIsResetModalOpen(true)}
                >
                  Reset to original
                </button>
              </div>
            </div>
          )}

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
            <h2 className="recipe-headline">
              {isViewingCustom ? `${recipe.title} · My version` : recipe.title}
            </h2>
            <p className="recipe-author-subtitle">
              Shared by {recipe.authorName || 'Home Cook'}
              {isAuthor && <span className="author-badge">You</span>}
            </p>

            <div className="meta-info-row">
              <span className="meta-pill">⏱️ {recipe.cookingTime || 15} min</span>
              <span className="meta-pill">👥 {displayedServings} servings</span>
              {recipe.difficulty && (
                <span className="meta-pill">📊 {recipe.difficulty}</span>
              )}
              {recipe.category && (
                <span className="meta-pill">🏷️ {recipe.category}</span>
              )}
            </div>

            {/* Dietary Tags & Personal Tags */}
            {(recipe.dietaryTags?.length > 0 || displayedPersonalTags.length > 0) && (
              <div className="dietary-tags-list">
                {recipe.dietaryTags?.map((tag) => (
                  <span key={tag} className="recipe-tag-chip">
                    {tag}
                  </span>
                ))}
                {displayedPersonalTags.map((tag) => (
                  <span key={`ptag-${tag}`} className="recipe-tag-chip personal">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Ingredient substitutions & personal notes summary when viewing private version */}
            {isViewingCustom && displayedSubstitutions.length > 0 && (
              <div className="custom-details-callout">
                <strong className="custom-callout-title">Your ingredient substitutions:</strong>
                <ul className="custom-swaps-ul">
                  {displayedSubstitutions.map((swap, idx) => (
                    <li key={idx}>
                      {swap.original} → <strong>{swap.replacement}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {isViewingCustom && customization.personalNotes && (
              <div className="custom-details-callout">
                <strong className="custom-callout-title">Personal notes:</strong>
                <p className="custom-callout-notes">{customization.personalNotes}</p>
              </div>
            )}

            {/* Dietary Conflict Alert when recipe overlaps with user allergens / custom restrictions */}
            {dietaryConflicts.length > 0 && (
              <div className="dietary-conflict-alert" role="note">
                Heads up: Ingredients may conflict with your dietary preferences (
                <strong>{dietaryConflicts.join(', ')}</strong>).
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
              Ingredients · {displayedServings} servings
            </h3>
            <ul className="ingredients-checklist">
              {displayedIngredients.length > 0 ? (
                displayedIngredients.map((item, idx) => (
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
          <IngredientSubstitutions ingredients={displayedIngredients} />
          <hr className="details-hr" />

          {/* Instructions */}
          <section className="details-section">
            <h3 className="section-header">Preparation</h3>
            <ol className="instructions-list">
              {displayedInstructions.length > 0 ? (
                displayedInstructions.map((step, idx) => (
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
          {/* Ratings & Reviews */}
          <RatingsReviews recipeId={recipe.id} />
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

            <Link to={`/recipes/${recipe.id}/customize`} className="btn-customize-details">
              {customization ? 'Edit Customization' : 'Customize Recipe'}
            </Link>

            <button
              type="button"
              className="btn-organize-collection"
              onClick={() => {
                if (!activeUserId) {
                  setToast({ type: 'error', message: 'Please sign in to organize recipes.' })
                  return
                }
                setCollections(cookbookStorage.getUserCollections(activeUserId))
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

      <ResetCustomizationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        recipeTitle={recipe.title}
        authorName={recipe.authorName}
        onConfirm={handleConfirmResetCustomization}
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
