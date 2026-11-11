import Modal from '../common/Modal'
import './CookbookModals.css'

export default function ResetCustomizationModal({
  isOpen,
  onClose,
  recipeTitle,
  authorName,
  onConfirm
}) {
  const handleConfirm = () => {
    onConfirm?.()
    onClose?.()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="440px" showCloseButton={false}>
      <div className="cookbook-modal-form">
        <h2 className="cookbook-modal-heading">Reset customization</h2>
        <h3 className="delete-target-title">
          Reset “{recipeTitle || 'this recipe'}” to original?
        </h3>
        <p className="cookbook-modal-sub">
          Your private customization (serving size, ingredients, quantities, substitutions,
          cooking instructions, notes, and personal tags) will be removed.
        </p>

        <div className="delete-info-callout">
          <h4 className="callout-heading">Bookmarks and collections stay intact</h4>
          <p className="callout-body">
            This recipe will remain saved in your cookbook collections, and{' '}
            {authorName ? `${authorName}'s` : 'the'} original recipe is never modified.
          </p>
        </div>

        <div className="cookbook-modal-actions">
          <button type="button" className="btn-modal-primary" onClick={handleConfirm}>
            Reset to original
          </button>
          <button type="button" className="btn-modal-secondary" onClick={onClose}>
            Cancel · Keep customization
          </button>
        </div>
      </div>
    </Modal>
  )
}

