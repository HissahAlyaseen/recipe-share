import Modal from "./Modal";
import Modal from "./Modal";
import "./Modal.css";
import "../../styles/shared.css";


// "Are you sure?" popup used before destructive actions, laid out like the
// Figma "Delete recipe confirmation": message, optional grey note,
// then two full-width buttons stacked (confirm on top, cancel below).
// It is only rendered when needed, so isOpen is always true here.
export default function ConfirmDialog({
  title,
  message,
  note,                  // optional { title, text } shown in a grey info box
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) {
  return (
    <Modal isOpen onClose={onCancel} title={title} maxWidth="420px">
      <p className="confirm-message">{message}</p>
      {note && (
        <div className="info-box">
          <strong>{note.title}</strong>
          <p>{note.text}</p>
        </div>
      )}
      <div className="stacked-actions">
        <button type="button" className="btn btn-primary btn-block" onClick={onConfirm}>{confirmLabel}</button>
        <button type="button" className="btn btn-secondary btn-block" onClick={onCancel}>{cancelLabel}</button>
      </div>
    </Modal>
  )
}
