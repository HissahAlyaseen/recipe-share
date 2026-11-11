import { useState } from 'react'
import Modal from '../common/Modal'
import './CookbookModals.css'

export default function CreateCookbookModal({ isOpen, onClose, onCreate, existingCollections = [] }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const handleClose = () => {
    setName('')
    setDescription('')
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

    const isDuplicate = existingCollections.some(
      (c) => String(c.name ?? '').trim().toLowerCase() === trimmed.toLowerCase()
    )
    if (isDuplicate) {
      setError('A cookbook with this name already exists. Please choose a unique name.')
      return
    }

    try {
      const result = onCreate({ name: trimmed, description: description.trim() })
      if (result === null || result === false) {
        setError('A cookbook with this name already exists. Please choose a unique name.')
        return
      }
      handleClose()
    } catch (err) {
      setError(err.message || 'Unable to create cookbook. Please choose a unique name.')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="440px" showCloseButton={false}>
      <form onSubmit={handleSubmit} className="cookbook-modal-form" noValidate>
        <h2 className="cookbook-modal-heading">Create cookbook</h2>
        <p className="cookbook-modal-sub">Create a private collection for your saved recipes.</p>

        <div className="cookbook-form-group">
          <label htmlFor="create-cookbook-name" className="cookbook-form-label">
            Cookbook name *
          </label>
          <input
            id="create-cookbook-name"
            type="text"
            className={`cookbook-input ${error ? 'input-error' : ''}`}
            placeholder="Weekend favorites"
            value={name}
            maxLength={40}
            aria-invalid={Boolean(error)}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError('')
            }}
            autoFocus
          />
          <p className="cookbook-field-hint">Required · 1–40 characters · Use a unique name.</p>
          {error && <p className="cookbook-field-error" role="alert">{error}</p>}
        </div>

        <div className="cookbook-form-group">
          <label htmlFor="create-cookbook-desc" className="cookbook-form-label">
            Description (optional)
          </label>
          <textarea
            id="create-cookbook-desc"
            className="cookbook-textarea"
            placeholder="Recipes for relaxed weekends."
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
            Create cookbook
          </button>
          <button type="button" className="btn-modal-secondary" onClick={handleClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}

