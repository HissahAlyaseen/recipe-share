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
  const getInitialColIds = () => {
    if (!collections.length || !recipe) return []
    return collections
      .filter((c) => c.recipeIds?.some((id) => Number(id) === Number(recipe.id)))
      .map((c) => String(c.id))
  }

  const [selectedColIds, setSelectedColIds] = useState(getInitialColIds)
  const [prevModalKey, setPrevModalKey] = useState(`${Boolean(isOpen)}_${recipe?.id ?? 'none'}`)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newColName, setNewColName] = useState('')
  const [newColDesc, setNewColDesc] = useState('')
  const [createError, setCreateError] = useState('')

  // Reset selected cookbooks to match the recipe's current collections whenever modal opens or recipe changes
  const currentModalKey = `${Boolean(isOpen)}_${recipe?.id ?? 'none'}`
  if (prevModalKey !== currentModalKey) {
    setPrevModalKey(currentModalKey)
    if (isOpen && recipe) {
      setSelectedColIds(getInitialColIds())
      setIsCreatingNew(false)
      setNewColName('')
      setNewColDesc('')
      setCreateError('')
    }
  }

  if (!recipe) return null

  const handleToggleCol = (colId) => {
    const idStr = String(colId)
    setSelectedColIds((prev) =>
      prev.includes(idStr) ? prev.filter((id) => id !== idStr) : [...prev, idStr]
    )
  }

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
    const isDup = collections.some(
      (c) => String(c.name ?? '').trim().toLowerCase() === trimmed.toLowerCase()
    )
    if (isDup) {
      setCreateError('A cookbook with this name already exists. Please choose a unique name.')
      return
    }

    try {
      const created = onCreateCollection({ name: trimmed, description: newColDesc.trim() })
      if (!created || !created.id) {
        setCreateError('A cookbook with this name already exists. Please choose a unique name.')
        return
      }
      setSelectedColIds((prev) =>
        prev.includes(String(created.id)) ? prev : [...prev, String(created.id)]
      )
      setIsCreatingNew(false)
      setNewColName('')
      setNewColDesc('')
      setCreateError('')
    } catch (err) {
      setCreateError(err.message || 'Unable to create cookbook. Please choose a unique name.')
    }
  }

  const handleConfirmSave = () => {
    onSave(recipe.id, selectedColIds)
    handleClose()
  }

  const selectedCols = collections.filter((c) => selectedColIds.includes(String(c.id)))

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
          <h3 className="choose-cookbook-heading">Choose cookbooks</h3>
          <p className="choose-cookbook-sub">Select one or more collections for this recipe.</p>

          <div className="collections-radio-list">
            {collections.map((col) => {
              const isSelected = selectedColIds.includes(String(col.id))
              const count = col.recipeIds?.length || 0
              return (
                <label
                  key={col.id}
                  className={`collection-radio-option ${isSelected ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    name="cookbook-collection"
                    value={col.id}
                    checked={isSelected}
                    onChange={() => handleToggleCol(col.id)}
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
                className={`cookbook-input inline-input ${createError ? 'input-error' : ''}`}
                value={newColName}
                maxLength={40}
                aria-invalid={Boolean(createError)}
                onChange={(e) => {
                  setNewColName(e.target.value)
                  if (createError) setCreateError('')
                }}
                autoFocus
              />
              {createError && <p className="cookbook-field-error" role="alert">{createError}</p>}
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
                  onClick={() => {
                    setIsCreatingNew(false)
                    setNewColName('')
                    setNewColDesc('')
                    setCreateError('')
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="selected-col-callout">
            <p className="callout-strong">
              Selected: {selectedCols.length > 0 ? selectedCols.map((c) => c.name).join(', ') : 'None'}
            </p>
            <p className="callout-muted">
              {selectedCols.length > 0
                ? 'The recipe will be saved to your selected cookbook(s). Your cookbooks are only visible to you.'
                : 'No collection selected. The recipe stays in All saved recipes.'}
            </p>
          </div>
        </div>

        <div className="cookbook-modal-actions">
          <button
            type="button"
            className="btn-modal-primary"
            onClick={handleConfirmSave}
          >
            {selectedCols.length === 1
              ? `Save to ${selectedCols[0].name}`
              : selectedCols.length > 1
                ? `Save to ${selectedCols.length} cookbooks`
                : 'Save to Cookbook'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

