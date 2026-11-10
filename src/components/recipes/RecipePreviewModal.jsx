import Modal from '../common/Modal'
import './RecipePreviewModal.css'

export default function RecipePreviewModal({
  isOpen,
  onClose,
  onPublish,
  recipeData,
  isPublishing
}) {
  if (!recipeData) return null

  const totalTime =
    (Number(recipeData.prepTime) || 0) + (Number(recipeData.cookingTime) || 0)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recipe Preview" maxWidth="640px">
      <div className="preview-container">
        {recipeData.image && (
          <div className="preview-image-wrapper">
            <img
              src={recipeData.image}
              alt={recipeData.title || 'Recipe preview'}
              className="preview-image"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>
        )}

        <div className="preview-header">
          <div className="preview-badges">
            {recipeData.category && (
              <span className="badge category-badge">{recipeData.category}</span>
            )}
            {recipeData.difficulty && (
              <span className="badge difficulty-badge">{recipeData.difficulty}</span>
            )}
            {recipeData.cuisine && (
              <span className="badge cuisine-badge">{recipeData.cuisine}</span>
            )}
          </div>

          <h2 className="preview-title">{recipeData.title || 'Untitled Recipe'}</h2>

          {recipeData.description && (
            <p className="preview-description">{recipeData.description}</p>
          )}

          <div className="preview-meta-grid">
            <div className="meta-card">
              <span className="meta-label">Prep Time</span>
              <span className="meta-value">{recipeData.prepTime || 0} min</span>
            </div>
            <div className="meta-card">
              <span className="meta-label">Cook Time</span>
              <span className="meta-value">{recipeData.cookingTime || 0} min</span>
            </div>
            <div className="meta-card">
              <span className="meta-label">Total Time</span>
              <span className="meta-value">{totalTime} min</span>
            </div>
            <div className="meta-card">
              <span className="meta-label">Servings</span>
              <span className="meta-value">{recipeData.servings || 1}</span>
            </div>
          </div>

          {recipeData.dietaryTags && recipeData.dietaryTags.length > 0 && (
            <div className="preview-tags-row">
              {recipeData.dietaryTags.map((tag) => (
                <span key={tag} className="tag-chip">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <hr className="preview-divider" />

        <div className="preview-section">
          <h3 className="section-title">Ingredients ({recipeData.ingredients?.length || 0})</h3>
          <ul className="preview-ingredients-list">
            {recipeData.ingredients && recipeData.ingredients.length > 0 ? (
              recipeData.ingredients.map((ing, idx) => (
                <li key={idx} className="preview-ingredient-item">
                  <span className="bullet">•</span>
                  <span>{ing}</span>
                </li>
              ))
            ) : (
              <li className="preview-empty-note">No ingredients added yet.</li>
            )}
          </ul>
        </div>

        <hr className="preview-divider" />

        <div className="preview-section">
          <h3 className="section-title">
            Preparation Steps ({recipeData.instructions?.length || 0})
          </h3>
          <ol className="preview-steps-list">
            {recipeData.instructions && recipeData.instructions.length > 0 ? (
              recipeData.instructions.map((step, idx) => (
                <li key={idx} className="preview-step-item">
                  <span className="step-num">{idx + 1}.</span>
                  <span className="step-text">{step}</span>
                </li>
              ))
            ) : (
              <li className="preview-empty-note">No preparation steps added yet.</li>
            )}
          </ol>
        </div>

        <div className="preview-actions">
          <button
            type="button"
            className="preview-btn-back"
            onClick={onClose}
            disabled={isPublishing}
          >
            Back to Editing
          </button>
          <button
            type="button"
            className="preview-btn-publish"
            onClick={onPublish}
            disabled={isPublishing}
          >
            {isPublishing ? 'Publishing...' : 'Publish Recipe Now'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

