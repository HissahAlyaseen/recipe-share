import { useState } from 'react'
import Modal from '../common/Modal'
import './CookbookModals.css'

function RenameModalContent({
  isOpen,
  onClose,
  collection,
  onRename,
  existingCollections = []
}) {
  const [name, setName] = useState(collection.name || '')
  const [description, setDescription] = useState(collection.description || '')
  const [error, setError] = useState('')

  const handleClose = () => {
    setError('')
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()

    if (!trimmed) {
      setError('Cookbook name is required.')
      return
    }

    if (trimmed.length > 40) {
      setError('Cookbook name must be between 1 and 40 characters.')
      return
    }

    // Check duplicate name with other collections
    const isDuplicate = existingCollections.some(
      (c) =>
        String(c.id) !== String(collection?.id) &&
        c.name.toLowerCase() === trimmed.toLowerCase()
    )
    if (isDuplicate) {
      setError('A cookbook with this name already exists. Please choose a unique name.')
      return
    }

    onRename(collection.id, trimmed, description.trim())
    handleClose()
  }

  const recipeCount = collection.recipeIds?.length || 0

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="440px" showCloseButton={false}>
      <form onSubmit={handleSubmit} className="cookbook-modal-form" noValidate>
        <h2 className="cookbook-modal-heading">Rename cookbook</h2>
        <p className="cookbook-modal-sub">
          Rename {collection.name}. Its {recipeCount} saved{' '}
          {recipeCount === 1 ? 'recipe' : 'recipes'} will stay in this collection.
        </p>

        <div className="cookbook-form-group">
          <label htmlFor="rename-cookbook-name" className="cookbook-form-label">
            Cookbook name *
          </label>
          <input
            id="rename-cookbook-name"
            type="text"
            className={`cookbook-input ${error ? 'input-error' : ''}`}
            placeholder="Weekend favorites"
            value={name}
            maxLength={40}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError('')
            }}
            autoFocus
          />
          <p className="cookbook-field-hint">Required · 1–40 characters · Use a unique name.</p>
          {error && <p className="cookbook-field-error">{error}</p>}
        </div>

        <div className="cookbook-form-group">
          <label htmlFor="rename-cookbook-desc" className="cookbook-form-label">
            Description (optional)
          </label>
          <textarea
            id="rename-cookbook-desc"
            className="cookbook-textarea"
            placeholder="Make-ahead meals for busy days."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <p className="cookbook-visibility-note">
          Visibility: Private · Only you can see this cookbook.
        </p>

        <div className="cookbook-modal-actions">
          <button type="submit" className="btn-modal-primary">
            Save new name
          </button>
          <button type="button" className="btn-modal-secondary" onClick={handleClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function RenameCookbookModal({
  isOpen,
  onClose,
  collection,
  onRename,
  existingCollections = []
}) {
  if (!isOpen || !collection) return null

  return (
    <RenameModalContent
      key={collection.id}
      isOpen={isOpen}
      onClose={onClose}
      collection={collection}
      onRename={onRename}
      existingCollections={existingCollections}
    />
  )
}
