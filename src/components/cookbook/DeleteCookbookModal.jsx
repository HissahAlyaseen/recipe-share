import Modal from '../common/Modal'
import './CookbookModals.css'

export default function DeleteCookbookModal({ isOpen, onClose, collection, onDelete }) {
  if (!collection) return null

  const recipeCount = collection.recipeIds?.length || 0

  const handleConfirm = () => {
    onDelete(collection.id)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="440px" showCloseButton={false}>
      <div className="cookbook-modal-form">
        <h2 className="cookbook-modal-heading">Delete collection confirmation</h2>
        <h3 className="delete-target-title">Delete “{collection.name}”?</h3>
        <p className="cookbook-modal-sub">
          This private collection contains {recipeCount} saved{' '}
          {recipeCount === 1 ? 'recipe' : 'recipes'}.
        </p>

        <div className="delete-info-callout">
          <h4 className="callout-heading">Your recipes will not be deleted</h4>
          <p className="callout-body">
            Only the collection is removed. All {recipeCount}{' '}
            {recipeCount === 1 ? 'recipe remains' : 'recipes remain'} in All saved recipes and in
            any other collections.
          </p>
        </div>

        <div className="cookbook-modal-actions">
          <button type="button" className="btn-modal-primary" onClick={handleConfirm}>
            Delete collection
          </button>
          <button type="button" className="btn-modal-secondary" onClick={onClose}>
            Cancel · Keep collection
          </button>
        </div>
      </div>
    </Modal>
  )
}

