import { useState } from 'react'
import Modal from '../common/Modal'
import './CookbookModals.css'

export default function SaveToCookbookModal({
  isOpen,
  onClose,
  recipe,
  collections = [],
  onSave,
  onCreateCollection
}) {
  const [selectedColId, setSelectedColId] = useState(() => {
    return collections.length > 0 ? collections[0].id : null
  })
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newColName, setNewColName] = useState('')
  const [newColDesc, setNewColDesc] = useState('')
  const [createError, setCreateError] = useState('')

  if (!recipe) return null

  const handleClose = () => {
    setIsCreatingNew(false)
    setNewColName('')
    setNewColDesc('')
    setCreateError('')
    onClose()
  }

  const handleCreateNew = (e) => {
    e.preventDefault()
    const trimmed = newColName.trim()
    if (!trimmed) {
      setCreateError('Cookbook name is required.')
      return
    }
    if (trimmed.length > 40) {
      setCreateError('Cookbook name must be 1-40 characters.')
      return
    }
    const isDup = collections.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())
    if (isDup) {
      setCreateError('A cookbook with this name already exists.')
      return
    }

    const created = onCreateCollection({ name: trimmed, description: newColDesc.trim() })
    if (created) {
      setSelectedColId(created.id)
      setIsCreatingNew(false)
      setNewColName('')
      setNewColDesc('')
      setCreateError('')
    }
  }

  const handleConfirmSave = () => {
    onSave(recipe.id, selectedColId)
    handleClose()
  }

  const selectedCol = collections.find((c) => String(c.id) === String(selectedColId))

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="480px" showCloseButton={false}>
      <div className="cookbook-modal-form save-to-modal">
        <div className="modal-header-cancel-row">
          <button type="button" className="btn-cancel-link" onClick={handleClose}>
            ‹ Cancel · Back to recipe
          </button>
        </div>

        <h2 className="cookbook-modal-heading">Save to Cookbook</h2>

        {/* Recipe Mini Preview */}
        <div className="save-modal-recipe-card">
          <div className="save-modal-thumb">
            {recipe.image ? (
              <img src={recipe.image} alt={recipe.title} className="thumb-img" />
            ) : (
              <div className="thumb-placeholder-mini">
                <span className="thumb-icon-rect" />
                <span className="thumb-mini-text">Recipe photo</span>
              </div>
            )}
          </div>
          <div className="save-modal-recipe-info">
            <h4 className="save-modal-title">{recipe.title}</h4>
            <p className="save-modal-meta">
              {recipe.cookingTime || 20} min · {recipe.category || 'Dinner'}
              {recipe.dietaryTags && recipe.dietaryTags.length > 0 && ` · ${recipe.dietaryTags.join(', ')}`}
            </p>
          </div>
        </div>

        {/* Choose a cookbook section */}
        <div className="choose-cookbook-section">
          <h3 className="choose-cookbook-heading">Choose a cookbook</h3>
          <p className="choose-cookbook-sub">Select one collection for this recipe.</p>

          <div className="collections-radio-list">
            {collections.map((col) => {
              const isSelected = String(col.id) === String(selectedColId)
              const count = col.recipeIds?.length || 0
              return (
                <label
                  key={col.id}
                  className={`collection-radio-option ${isSelected ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="cookbook-collection"
                    value={col.id}
                    checked={isSelected}
                    onChange={() => setSelectedColId(col.id)}
                    className="radio-circle-input"
                  />
                  <div className="radio-option-info">
                    <span className="col-opt-name">{col.name}</span>
                    <span className="col-opt-meta">
                      {count} {count === 1 ? 'recipe' : 'recipes'} · Private
                    </span>
                  </div>
                </label>
              )
            })}
          </div>

          {!isCreatingNew ? (
            <button
              type="button"
              className="btn-open-create-inline"
              onClick={() => setIsCreatingNew(true)}
            >
              + Create new cookbook
            </button>
          ) : (
            <form onSubmit={handleCreateNew} className="inline-create-box">
              <h4 className="inline-create-title">New cookbook</h4>
              <input
                type="text"
                placeholder="Cookbook name (e.g. Quick Lunches)"
                className="cookbook-input inline-input"
                value={newColName}
                maxLength={40}
                onChange={(e) => {
                  setNewColName(e.target.value)
                  if (createError) setCreateError('')
                }}
                autoFocus
              />
              {createError && <p className="cookbook-field-error">{createError}</p>}
              <textarea
                placeholder="Description (optional)"
                className="cookbook-textarea inline-textarea"
                rows={2}
                value={newColDesc}
                onChange={(e) => setNewColDesc(e.target.value)}
              />
              <div className="inline-create-btns">
                <button type="submit" className="btn-modal-primary inline-btn">
                  Add collection
                </button>
                <button
                  type="button"
                  className="btn-modal-secondary inline-btn"
                  onClick={() => setIsCreatingNew(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {selectedCol && (
            <div className="selected-col-callout">
              <p className="callout-strong">Selected: {selectedCol.name}</p>
              <p className="callout-muted">
                The recipe will be added to this cookbook. Your cookbooks are only visible to you.
              </p>
            </div>
          )}
        </div>

        <div className="cookbook-modal-actions">
          <button
            type="button"
            className="btn-modal-primary"
            onClick={handleConfirmSave}
          >
            {selectedCol ? `Save to ${selectedCol.name}` : 'Save to Cookbook'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

