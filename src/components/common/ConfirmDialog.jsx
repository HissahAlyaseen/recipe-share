import Modal from './common/Modal' // the team's shared Modal

// "Are you sure?" popup used before destructive actions
// (suspend user, delete recipe, remove review, clear week).
// It is only rendered when needed, so isOpen is always true here.
export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', danger, onConfirm, onCancel }) {
  return (
    <Modal isOpen onClose={onCancel} title={title} maxWidth="420px">
      <p>{message}</p>
      <div className="confirm-actions">
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
