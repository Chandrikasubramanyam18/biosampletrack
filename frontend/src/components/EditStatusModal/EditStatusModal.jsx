import { useState, useEffect } from 'react'
import { X, Pencil } from 'lucide-react'
import { updateSampleStatus } from '../../services/api'
import { useToast } from '../Toast/Toast'
import StatusBadge from '../StatusBadge/StatusBadge'

const STATUSES = ['Received', 'QC', 'Library Prep', 'Sequencing', 'Analysis', 'Completed', 'Failed']

/**
 * EditStatusModal — allows updating the workflow status of a sample.
 * Props:
 *   sample    Sample | null  (null = closed)
 *   onClose   () => void
 *   onSuccess () => void
 */
export default function EditStatusModal({ sample, onClose, onSuccess }) {
  const toast = useToast()
  const [status, setStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (sample) {
      setStatus(sample.status)
      setError(null)
    }
  }, [sample])

  if (!sample) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await updateSampleStatus(sample.sample_id, status)
      toast({ message: `Status of "${sample.sample_id}" updated to "${status}".`, type: 'success' })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Pencil size={18} />
            Update Workflow Status
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
              Updating status for sample{' '}
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{sample.sample_id}</strong>.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginRight: '8px' }}>
                Current:
              </span>
              <StatusBadge status={sample.status} />
            </div>

            <div className="form-group">
              <label className="form-label">New Status *</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => { setStatus(e.target.value); setError(null) }}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {error && (
              <p style={{ marginTop: '12px', color: '#dc2626', fontSize: '0.875rem',
                background: '#fef2f2', padding: '10px 14px', borderRadius: '6px',
                border: '1px solid #fecaca' }}>
                {error}
              </p>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || status === sample.status}>
              {submitting ? 'Saving…' : 'Save Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
