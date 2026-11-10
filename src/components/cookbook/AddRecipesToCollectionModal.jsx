import { useState } from 'react'
import Modal from '../common/Modal'
import './CookbookModals.css'

export default function AddRecipesToCollectionModal({
  isOpen,
  onClose,
  collection,
  allSavedRecipes = [],
  onAddRecipes
}) {
  const [selectedIds, setSelectedIds] = useState([])

  if (!collection) return null

  const existingIds = (collection.recipeIds || []).map((id) => Number(id))
  // Filter candidates: recipes saved by the user that are NOT yet in this collection
  const candidateRecipes = allSavedRecipes.filter((r) => !existingIds.includes(Number(r.id)))

  const handleToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleClose = () => {
    setSelectedIds([])
    onClose()
  }

  const handleSave = () => {
    if (selectedIds.length === 0) {
      handleClose()
      return
    }
    onAddRecipes(collection.id, selectedIds)
    handleClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="480px" showCloseButton={false}>
      <div className="cookbook-modal-form">
        <div className="modal-header-cancel-row">
          <button type="button" className="btn-cancel-link" onClick={handleClose}>
            ‹ Cancel
          </button>
        </div>

        <h2 className="cookbook-modal-heading">Add recipes to collection</h2>
        <p className="cookbook-modal-sub">
          Select recipes from your saved cookbook to add to <strong>{collection.name}</strong>.
        </p>

        {candidateRecipes.length > 0 ? (
          <div className="add-recipes-checklist">
            {candidateRecipes.map((recipe) => {
              const isChecked = selectedIds.includes(recipe.id)
              return (
                <label
                  key={recipe.id}
                  className={`add-recipe-option-item ${isChecked ? 'checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="add-recipe-checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle(recipe.id)}
                  />
                  <div className="add-recipe-mini-thumb">
                    {recipe.image ? (
                      <img src={recipe.image} alt={recipe.title} className="thumb-img" />
                    ) : (
                      <span className="thumb-placeholder-text">🍲</span>
                    )}
                  </div>
                  <div className="add-recipe-info">
                    <span className="add-recipe-title">{recipe.title}</span>
                    <span className="add-recipe-meta">
                      {recipe.cookingTime || 20} min · {recipe.category || 'Dinner'} · By{' '}
                      {recipe.authorName || 'Home Cook'}
                    </span>
                  </div>
                </label>
              )
            })}
          </div>
        ) : (
          <div className="add-recipes-empty-box">
            <p className="empty-title">All your saved recipes are already in this collection!</p>
            <p className="empty-desc">
              Browse community recipes to discover and save more dishes to your cookbook.
            </p>
          </div>
        )}

        <div className="cookbook-modal-actions" style={{ marginTop: '16px' }}>
          {candidateRecipes.length > 0 && (
            <button
              type="button"
              className="btn-modal-primary"
              onClick={handleSave}
              disabled={selectedIds.length === 0}
            >
              Add {selectedIds.length > 0 ? `(${selectedIds.length})` : ''} to {collection.name}
            </button>
          )}
          <button type="button" className="btn-modal-secondary" onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  )
}

