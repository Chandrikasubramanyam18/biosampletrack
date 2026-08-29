import { AlertTriangle, X } from 'lucide-react'
import './ConfirmDialog.css'

/**
 * ConfirmDialog — shown before destructive operations (delete).
 * Props:
 *   isOpen      boolean
 *   title       string
 *   message     string
 *   confirmLabel string (default "Confirm")
 *   onConfirm   () => void
 *   onCancel    () => void
 *   loading     boolean
 */
export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-header">
          <div className="confirm-icon">
            <AlertTriangle size={22} />
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onCancel}>
            <X size={18} />
          </button>
        </div>
        <div className="confirm-body">
          <h2 className="confirm-title">{title}</h2>
          {message && <p className="confirm-message">{message}</p>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
