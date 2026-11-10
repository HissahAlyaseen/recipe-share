import { useEffect } from 'react'
import './Modal.css'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '520px',
  showCloseButton = true
}) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && <h2 className="modal-title">{title}</h2>}
            {showCloseButton && (
              <button
                type="button"
                className="modal-close-btn"
                onClick={onClose}
                aria-label="Close dialog"
              >
                ✕
              </button>
            )}
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

