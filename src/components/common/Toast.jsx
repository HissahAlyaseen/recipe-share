import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import './Toast.css'

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!duration || !onClose) return
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!message) return null

  // Strip any redundant leading symbols to avoid double marks
  const cleanMessage =
    typeof message === 'string'
      ? message.replace(/^(\u2713|\u2714|✓|✔|ℹ️|⚠️|\s)+/, '').trim()
      : message

  const toastNode = (
    <div className={`toast-banner toast-${type}`} role="alert">
      <span className="toast-icon">
        {type === 'success' ? '✓' : type === 'error' ? '⚠️' : 'ℹ️'}
      </span>
      <span className="toast-message">{cleanMessage}</span>
      {onClose && (
        <button
          type="button"
          className="toast-close"
          onClick={onClose}
          aria-label="Close notification"
        >
          ✕
        </button>
      )}
    </div>
  )

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(toastNode, document.body)
  }

  return toastNode
}
